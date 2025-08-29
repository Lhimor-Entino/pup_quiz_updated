import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Explore Section - Title at the top-left */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Explore</h2>
                            </div>

                            {/* First Card - Create from your study materials */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="flex">
                                        <div className="w-16">
                                            <img
                                                src="https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg"
                                                alt="Icon"
                                                className="w-15 h-15 object-cover mx-auto"
                                            />
                                        </div>
                                        <div className="w-3/4 p-4">
                                            <h3 className="text-lg font-semibold">Create from Your Study Materials</h3>
                                            <p className="mt-2 text-gray-600">Upload your study materials to generate quizzes and assessments from them.</p>
                                            <input type="file" className="mt-4 p-2 border rounded-md w-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Second Card - Custom Prompt */}
                                <div className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="flex">
                                        <div className="w-16">
                                            <img
                                                src="https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg"
                                                alt="Icon"
                                                className="w-15 h-15 object-cover mx-auto"
                                            />
                                        </div>
                                        <div className="w-3/4 p-4">
                                            <h3 className="text-lg font-semibold">Custom Prompt</h3>
                                            <p className="mt-2 text-gray-600">Create an assessment on any topic with a custom prompt.</p>
                                            <input type="file" className="mt-4 p-2 border rounded-md w-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Two More Empty Cards with Increased Height */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                                <div className="bg-white shadow rounded-lg p-6 h-48">
                                    {/* Empty Card 1 */}
                                </div>
                                <div className="bg-white shadow rounded-lg p-6 h-48">
                                    {/* Empty Card 2 */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
