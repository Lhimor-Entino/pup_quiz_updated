import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

const quiz: React.FC = () => {

  useEffect(() => {
    const timer = setTimeout(() => {


      router.visit('home');
    }, 5000);

    return () => clearTimeout(timer); // Clear timeout if component unmounts
  }, []);


  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 to-yellow-400">

      <div className="text-center">
        <h1 className="text-[100px] font-bold relative inline-block text-red-600 drop-shadow-[4px_4px_0_#ffcc00] shadow-black shadow-lg">
          logo
        </h1>
        <br />
        <h1 className="text-[100px] font-bold relative inline-block text-yellow-400 drop-shadow-[4px_4px_0_#e60000] shadow-black shadow-lg mb-8">
          QUIZ
        </h1>

        {/* Loading Animation */}
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        </div>
        <p className="text-red-600 mt-4 text-xl font-semibold animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default quiz;
