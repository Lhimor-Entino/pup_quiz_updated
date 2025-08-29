import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function AccountSettings() {
    return (
        <AuthenticatedLayout>
            <Head title="Account Settings" />

            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Column 1 - Navigation */}
                        <div className="border-r-4 border-red-500 pr-4">
                            <h2 className="text-3xl font-bold text-red-600 mb-6">Settings</h2>
                            <ul className="space-y-2 text-gray-700">
                                <li className="font-semibold text-red-600">Account Settings</li>
                                <li>
                                <a href="/privacy" className="hover:text-red-600 text-gray-700 block">Privacy & Data</a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 2 - Account Info & Password */}
                        <div className="space-y-6">
                            {/* Profile Info Card */}
                            <div className="border border-black rounded-[20px] p-6 bg-white shadow">
                                <div className="flex items-center space-x-4 mb-4">
                                    <img
                                        src="https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg"
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                    <div>
                                        <p><strong>Name:</strong> Sample Name</p>
                                        <p><strong>Email:</strong> sample@email.com</p>
                                        <p><strong>Program:</strong> BSIT</p>
                                        <p><strong>Student ID:</strong> 2023-00001</p>
                                    </div>
                                </div>
                            </div>

                            {/* Change Password Card */}
                            <div className="border border-black rounded-[20px] p-6 bg-white shadow">
                                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">New Password</label>
                                        <input type="password" className="w-full border rounded-md p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Confirm Password</label>
                                        <input type="password" className="w-full border rounded-md p-2" />
                                    </div>
                                    <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Column 3 - Edit Info */}
                        <div className="border border-black rounded-[20px] p-6 bg-white shadow">
                            <h3 className="text-lg font-semibold mb-4">Edit Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Photo</label>
                                    <input type="file" className="w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name</label>
                                    <input type="text" className="w-full border rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name</label>
                                    <input type="text" className="w-full border rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email" className="w-full border rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Program</label>
                                    <input type="text" className="w-full border rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Student ID</label>
                                    <input type="text" className="w-full border rounded-md p-2" />
                                </div>
                                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
