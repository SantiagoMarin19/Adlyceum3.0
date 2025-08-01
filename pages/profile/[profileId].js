import React, {useCallback, useEffect, useRef, useState} from 'react'
import {updateProfile} from 'handlers/profile';
import {upload} from 'handlers/bll';
import withSession from 'utils/withSession';
import {request} from 'utils/graphqlRequest';
import {query} from 'gql';
import Main from 'components/Main/Main';
import {useRouter} from 'next/router';
import {INPUT_TYPES, verifyMutipleFields} from 'utils/form';

import {isAdmin as isUserAdmin, isProfessor as isUserProfessor, POST_REVIEW_STATUS} from 'utils';
import useUser from "../../utils/useUser";

import UserInfo from 'components/Profile/UserInfo';
import Courses from 'components/Profile/Courses';
import Publications from 'components/Profile/Publications';
import Loader from 'components/Loader/Loader';
import ContentTabs from 'components/Profile/Tabs'
import Company from 'components/Profile/Company'

import styles from 'components/Profile/styles'

const DEFAULT_USER_ID = 'me'

const DEFAULT_ERRORFORM = {field: null, msg: null};

function Profile({profile = {}, courses = [], posts = [], archivePosts = [], isAdmin = false}) {
  const {user} = useUser({redirectTo: '/'})
  const router = useRouter();
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [formState, setFormState] = useState({
    ...profile,
    languages: profile.languages || [],
    education: profile.education || [],
    workExperience: profile.workExperience || []
  });
  const [errorForm, setErrorForm] = useState(DEFAULT_ERRORFORM);
  const [avatarImage, setAvatarImage] = useState(null);
  const [activeModeEdit, setActiveModeEdit] = useState(true)
  const {query: {profileId}} = useRouter();
  const isCurrentUserProfile = profileId === DEFAULT_USER_ID;
  const refs = {
    avatar: useRef()
  };

  useEffect(() => {
    if (!profile) router.push('/');
  }, [profile]);

  const triggerLoading = (show) => {
    if (show) {
      document.getElementsByTagName('body')[0].classList.add('htmlBackgroundBackdrop');
      setShowLoadingScreen(true);
    } else {
      document.getElementsByTagName('body')[0].classList.remove('htmlBackgroundBackdrop');
      setShowLoadingScreen(false);
    }
  }

  const onChange = useCallback(async (e, name) => {
    try {
      const isFileInput = refs[name]?.current?.files;
      if (isFileInput) {
        triggerLoading(true);
        const _files = refs[name].current.files;
        const itemValue = await upload(_files, true, profile?.avatar?.id);
        // Preview the image
        if (_files?.length && FileReader) {
          const fileReader = new FileReader();
          fileReader.onload = () => setAvatarImage(fileReader.result);
          fileReader.readAsDataURL(_files[0]);
        }

        triggerLoading(false);
        updateFormState(name, itemValue);
        return;
      }

      // Manejo para campos tipo array (idiomas, educación, experiencia)
      if (
        name === INPUT_TYPES.LANGUAGES ||
        name === INPUT_TYPES.EDUCATION ||
        name === INPUT_TYPES.WORK_EXPERIENCE
      ) {
        updateFormState(name, e); // e es el nuevo array
        return;
      }

      // Manejo para booleanos (ej: sharing)
      if (typeof e === "boolean") {
        updateFormState(name, e);
        return;
      }

      // Manejo para otros campos (eventos normales)
      let itemValue = e?.target?.value ?? e;
      if (name === INPUT_TYPES.PHONE) {
        itemValue = /^\d*[.]?\d*$/.test(itemValue) ? itemValue : formState[name];
      }
      updateFormState(name, itemValue);
    } catch (e) {
      console.error("Algo salio mal", e)
    } finally {
      triggerLoading(false);
    }
  }, [formState, refs, profile?.avatar?.id]);

  const updateFormState = (name, value) => {
    setFormState(prevState => ({...prevState, [name]: value}));
  };

  const submitUpdateProfile = useCallback(async (e) => {
    e.preventDefault();
    triggerLoading(true);
    const {
      id,
      role,
      dim,
      fullname,
      email,
      phone,
      avatar,
      birthdate,
      gender,
      residence,
      level,
      sharing,
      experience,
      updatedAt,
      languages,
      education,
      workExperience // camelCase en frontend
    } = formState;

    const fieldsStatus = verifyMutipleFields([
      {field: INPUT_TYPES.FULLNAME, value: fullname, required: true},
      {field: INPUT_TYPES.EMAIL, value: email, required: true},
      {field: INPUT_TYPES.DIM, value: dim, required: true},
      {field: INPUT_TYPES.PHONE, value: phone, required: true, length: 8},
      {field: INPUT_TYPES.BIRTHDATE, value: birthdate, required: true},
      {field: INPUT_TYPES.LANGUAGES, value: languages, required: true},
      {field: INPUT_TYPES.EDUCATION, value: education, required: true},
      {field: INPUT_TYPES.WORK_EXPERIENCE, value: workExperience, required: true},
      // ...otros campos...
    ]);

    if (fieldsStatus) {
      setErrorForm(fieldsStatus);
      triggerLoading(false);
      return;
    } else {
      setErrorForm(DEFAULT_ERRORFORM);
    }

    const entry = await updateProfile(id, {
      role: role.id,
      fullname: fullname?.trim(),
      email: email?.trim(),
      phone: phone != null ? String(phone).trim() : '',
      birthdate,
      gender,
      dim,
      residence: residence?.trim(),
      level: level?.trim(),
      experience: experience?.trim(),
      sharing,
      languages: JSON.stringify(languages),
      education: JSON.stringify(education),
      work_experience: JSON.stringify(workExperience),
      ...(avatar?.id ? {avatar: avatar?.id} : null),
    });

    if (entry.error) {
      alert('No se pudo actualizar la entrada');
    } else {
      // Parsear los campos si vienen como string
      const parseIfString = (val) => {
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch { return []; }
        }
        return Array.isArray(val) ? val : [];
      };

      // Soft refresh: volver a pedir los datos actualizados al backend
      try {
        const profileQuery = isCurrentUserProfile
          ? query.user.GET_PRIVATE_USER_PROFILE
          : query.user.GET_PUBLIC_USER_PROFILE;
        // Cambia aquí: request devuelve un array de resultados, toma el primero
        const [refreshed] = await request([profileQuery(id)]);
        const refreshedProfile = refreshed?.user || refreshed; // depende de tu estructura de respuesta

        setFormState({
          ...refreshedProfile,
          languages: parseIfString(refreshedProfile.languages),
          education: parseIfString(refreshedProfile.education),
          workExperience: parseIfString(refreshedProfile.work_experience || refreshedProfile.workExperience),
        });
        setActiveModeEdit(true); // Salir del modo edición después de refrescar
      } catch (refreshError) {
        // fallback: usar los datos locales si el refresh falla
        setFormState({
          ...entry,
          languages: parseIfString(entry.languages),
          education: parseIfString(entry.education),
          workExperience: parseIfString(entry.work_experience || entry.workExperience),
        });
        setActiveModeEdit(true);
      }

      if (avatar?.id) {
        entry.avatar = avatar
        entry.updatedAt = updatedAt
      }
    }
    triggerLoading(false);
  }, [formState, isCurrentUserProfile, query, request]);

  const doCancel = useCallback(() => {
    setFormState({
      ...profile,
      languages: profile.languages || [],
      education: profile.education || [],
      workExperience: profile.workExperience || [],
    });
    setAvatarImage(null);
  }, [profile]);

  const actionsTabs = [
    {
      name: 'Perfil',
      value: 'profile',
      component: <UserInfo
          isCurrentUserProfile={isCurrentUserProfile}
          avatarView={avatarImage || formState?.avatar?.url}
          submitUpdateProfile={submitUpdateProfile}
          doCancel={doCancel}
          onChange={onChange}
          setProfile={setFormState}
          errorState={errorForm}
          refAvatar={refs}
          items={posts.filter(item => item.review !== POST_REVIEW_STATUS.DRAFT)}
          user={user}
          activeView={activeModeEdit}
          setActiveView={setActiveModeEdit}
          {...formState} />
    },
    {
      name: 'Cursos',
      value: 'courses',
      component: <Courses items={courses}/>
    },
    {
      name: 'Borradores',
      value: 'drafts',
      action: 'animationend',
      component: <Publications itemsPerPage={10} items={posts.filter(item => item.review === POST_REVIEW_STATUS.DRAFT)}
                               label={"Borradores"} user={user}/>
    },
    {
      name: 'Tutorías',
      value: 'tutorials',
      component: <Publications itemsPerPage={10} items={archivePosts} label={"Tutorías"} user={user} isAdmin={isAdmin}/>
    },
    {
      name: 'Compañías',
      value: 'company',
      component: <Company label={"Compañías"} user={user} isAdmin={isAdmin}/>
    }
  ]

  return (
      <Main className="pt-[unset] p-[unset]">
        <div className={styles.contProfile}>
          <div className={styles.rightContainer}>
            <div className={styles.tabs}>
              <ContentTabs data={actionsTabs}/>
            </div>
          </div>
        </div>
        <Loader show={showLoadingScreen}/>
      </Main>
  );
}

export const getServerSideProps = withSession(async function ({req}) {
  const currentUser = req.session.get('user');
  if (!currentUser) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  const urlSplit = req.url.split('/');
  const userIdParam = urlSplit[urlSplit.length - 1];
  const isCurrentUserProfile = userIdParam === DEFAULT_USER_ID && currentUser;
  const isProfessor = isUserProfessor(currentUser.role?.id);
  const isAdmin = isUserAdmin(currentUser.role?.id);
  const profileId = isCurrentUserProfile ? currentUser.id : userIdParam
  const profileQuery = isCurrentUserProfile ?
      query.user.GET_PRIVATE_USER_PROFILE : query.user.GET_PUBLIC_USER_PROFILE;

  const {user: profile, allCourses, allPosts: posts} = await request([
    profileQuery(profileId),
    (isProfessor && isCurrentUserProfile) ?
        query.user.GET_USER_COURSES(profileId) : query.user.GET_STUDENT_COURSES(profileId),
    query.user.GET_USER_POSTS(profileId)
  ]);
  let archivePosts = {allPosts: []};
  if (isAdmin && isCurrentUserProfile) {
    archivePosts = await request(query.posts.GET_ADMIN_COURSES_POSTS());
  } else if (isProfessor && isCurrentUserProfile) {
    const profesorCourses = allCourses.filter(course => course?.professor?.id === profileId).map(course => course.id);
    archivePosts = await request(
        query.posts.GET_PROFESOR_COURSES_POSTS(profesorCourses)
    );
  }

  return {
    props: {
      profile,
      courses: allCourses,
      posts: posts,
      archivePosts: archivePosts?.allPosts || [],
      isProfessor,
      isAdmin
    }
  };
});

export default Profile;
