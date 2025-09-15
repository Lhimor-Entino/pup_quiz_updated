
import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
type Props = {}

const ParticipantManagement = (props: Props) => {
    return (
        <AuthenticatedLayout>
    
            <div className=" relative overflow-hidden h-[92%]">

                {/* Animated background elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-orange-800/10 rounded-full filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-32 right-16 w-96 h-96 bg-amber-400/15 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-orange-600/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>

                <div className="relative z-10 min-h-screen flex items-center justify-center">
                    <div className="text-center max-w-4xl mx-auto">

                        {/* Modern gradient text with shadow */}
                        <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent mb-8 tracking-tight leading-none drop-shadow-2xl">
                            COMING SOON
                        </h1>

                        {/* Stylized subtitle with backdrop blur */}
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mx-auto max-w-2xl shadow-2xl">
                            <p className="text-orange-600/90 text-2xl md:text-3xl font-light leading-relaxed">
                                Participant Logs will be Available here.
                            </p>
                            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mx-auto"></div>
                        </div>

                    </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>

            </div>

        </AuthenticatedLayout>

    )
}

export default ParticipantManagement