import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

/**
 * StudentMatcher Component
 * Props:
 * - students: array of student objects to match
 * - parseLevel: function to parse level string into {career, university, degree}
 * - onClose: function to close the matcher
 */
export default function StudentMatcher({ students, parseLevel, onClose }) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState(new Set());

  const slice = students.slice(index, index + 2);

  const handleLike = (id) => {
    setLiked((prev) => new Set(prev).add(id));
  };

  const prev = () => setIndex((i) => Math.max(0, i - 2));
  const next = () => setIndex((i) => Math.min(students.length - 2, i + 2));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-2/3">
        <h2 className="text-2xl font-semibold mb-4">Match Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slice.map((student) => {
            const { career } = parseLevel(student.level);
            return (
              <div key={student.id} className="border rounded-lg p-4 flex flex-col items-center">
                {student.avatar?.url ? (
                  <img
                    className="w-24 h-24 rounded-full mb-2 object-cover"
                    src={student.avatar.url}
                    alt={student.fullname}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-300 mb-2 flex items-center justify-center">
                    <span className="text-xl text-gray-700">
                      {student.fullname
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="text-lg font-medium">{student.fullname}</div>
                <div className="text-sm text-gray-500">{career || 'No especificado'}</div>
                <button
                  onClick={() => handleLike(student.id)}
                  className={`mt-4 p-2 rounded-full text-white flex items-center gap-1
                    ${liked.has(student.id) ? 'bg-green-500' : 'bg-blue-500'}`}
                >
                  <Heart className="w-4 h-4" />
                  {liked.has(student.id) ? 'Liked' : 'Like'}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={prev}
            disabled={index === 0}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 flex items-center gap-1"
          >
            <ChevronLeft /> Atrás
          </button>
          <button
            onClick={next}
            disabled={index + 2 >= students.length}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 flex items-center gap-1"
          >
            Siguiente <ChevronRight />
          </button>
        </div>
        <div className="text-right mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:underline">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}