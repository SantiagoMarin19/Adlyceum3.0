// File: pages/company/[id].js
import React, {  useState, useMemo, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

// Tabs Content
import { actionsTabs } from 'components/Company/constants'

// Components
import Header from 'components/Header/Header'
import Footer from 'components/Footer/Footer'
import Main from 'components/Main/Main';
import Loader from 'components/Loader/Loader';
import ContentTabs from 'components/Profile/Tabs'

// Styles
import styles from 'components/Company/styles'

// Hoosk
import { GET_ALL_STUDENTS, GET_ALL_STUDENTS_FIELDS, request} from 'utils/graphqlRequest';

/**
 * Company
 */
function Company({ companyData }) {
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const router = useRouter()
  const { id } = router.query

  if (router.isFallback)
    return <p>Cargando empresa…</p>

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
  )
}

// —– Props estáticas para _app.js —––
Company.pageTitle   = 'Panel de Empresa'
Company.hideNav     = false
Company.hideFooter  = false

// Server Props
export async function getServerSideProps({ params }) {
  const { id } = params
  const companyData = {
    id,
    name: `Nombre de la empresa ${id}`,
    description: `Esta es la descripción de la empresa con id ${id}.`
  }

  return {
    props: { companyData }
  }
}

export default Company