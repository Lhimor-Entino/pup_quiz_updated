import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Props = {};

const Home = (props: Props) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const content = [
        {
            image: '/images/carousel/slide1.png',
            title: '',
            description: 'Create, share, and play quizzes whenever and wherever you want.'
        },
        {
            image: '/images/carousel/slide2.png',
            title: '',
            description: 'Make quizzes fun and interesting to boost up your knowledge.'
        },
        {
            image: '/images/carousel/slide3.png',
            title: '',
            description: "Play and take quiz challenges with your friends."
        }
    ];

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 10000);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prevStep) => (prevStep === 3 ? 0 : prevStep + 1));
            setCurrentIndex((prevIndex) =>
                prevIndex === content.length - 1 ? 0 : prevIndex + 1
            );
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
                {/* Background Image */}
                <img
                    src="https://i.ibb.co/vCS1cLvs/Screenshot-2025-04-14-142453.png"
                    alt="Loading Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* GIF Loader */}
                <div className="relative z-10 flex flex-col items-center justify-end h-full w-full pb-20">
                    <img
                        src="https://media.tenor.com/_62bXB8gnzoAAAAj/loading.gif"
                        alt="Loading"
                        className="w-[80px] h-[80px]"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-0" style={{ width: "100%" }}>
            <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between max-w-7xl gap-8" style={{ width: "100%", maxWidth: "100%" }}>
                {/* Image Section */}
                <div className="flex-1 flex flex-col items-center w-auto lg:w-auto">
                    <div className="relative w-full flex justify-center">
                        <img
                            src={content[currentIndex].image}
                            alt="Quiz illustration"
                            className="w-full max-w-[500px] lg:max-w-[800px] h-auto aspect-square object-cover rounded-lg transition-all duration-500"
                        />
                    </div>

                    {/* Loading Bar */}
                    <div className="w-[80%] lg:w-[50%] mx-auto mb-4 lg:mb-6 mt-4 lg:mt-6">
                        <div className="w-full h-2 rounded-full bg-gray-300">
                            <div
                                className="h-full rounded-full"
                                style={{ backgroundColor: '#FF2C19', width: `${(currentStep / 3) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="font-bold text-xl lg:text-3xl text-gray-600 text-center mb-6 transition-all duration-500 min-h-[3em] max-w-xl px-4">
                        {content[currentIndex].description}
                    </p>
                </div>

                {/* Button Section */}
                <div className="flex-1 flex flex-col items-center w-full lg:max-w-md" style={{ maxWidth: "50%" }}>
                    {/* Logo */}
                    <div className="mb-6">
                        <img
                            src="/images/carousel/logooo.png"
                            alt="Logo"
                            className="w-[150px] h-[150px] lg:w-[200px] lg:h-[200px]"
                        />
                    </div>

                    {/* Get Started Button */}
                    <Link
                        href="/getStarted"
                        className="font-bold w-[80%] py-3 lg:py-4 bg-[#FF2C19] text-white text-center rounded-full hover:bg-[#e52913] transition-colors text-2xl lg:text-xl mb-3"
                        style={{ boxShadow: '0px 4px 10px 0px #9D1509', fontSize: "1.5rem", padding: "2rem" }}
                    >
                        GET STARTED
                    </Link>

                    {/* Already Have an Account Button */}
                    <Link
                        href="/login"
                        className="font-bold w-[80%] py-3 lg:py-4 bg-[#FFCCC8] text-[#FF2C19] text-center rounded-full hover:bg-pink-300 transition-colors text-lg lg:text-xl"
                        style={{ boxShadow: '0px 4px 10px 0px #FF8E84', fontSize: "1.5rem", padding: "2rem" }}
                    >
                        I ALREADY HAVE AN ACCOUNT
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
