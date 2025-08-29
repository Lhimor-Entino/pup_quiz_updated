import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Templates() {
    return (
        <AuthenticatedLayout>
            <Head title="Templates" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((num) => (
                            <Link
                                key={num}
                                href="/newquiz"
                                className="block bg-white shadow rounded-lg p-4 hover:shadow-lg transition"
                            >
                                <img
                                    src="https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg"
                                    alt={`Template ${num}`}
                                    className="w-full h-40 object-cover mb-4 rounded"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
