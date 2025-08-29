import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useState } from 'react';

export default function Register() {
    const [step, setStep] = useState(1);
    const [accountType, setAccountType] = useState('');
    const [userType, setUserType] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        account_type: '',
        user_type: '',
    });





    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />
            
            <form onSubmit={submit} className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg max-w-md w-full mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-6 text-center">Join QuizMaster</h2>
                        
                        <div>
                            <InputLabel htmlFor="name" value="Name" className="text-white" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        
                        <div className="mt-4">
                            <InputLabel htmlFor="email" value="Email" className="text-white" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                        
                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Password" className="text-white" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>
                        
                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                                className="text-white"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>
                        
                        <div className="mt-6 flex items-center justify-between">
                            <Link
                                href={route('login')}
                                className="text-white hover:text-white/80 transition-colors text-sm"
                            >
                                Already registered?
                            </Link>
                        
                            <PrimaryButton 
                                className="bg-white text-indigo-600 px-6 py-2 rounded-full hover:bg-indigo-50 transition-colors shadow-md" 
                                disabled={processing}
                                style={{color:"#610C9F"}}
                            >
                                Register
                            </PrimaryButton>
                        </div>
                    </form>
        </GuestLayout>
    );
}


