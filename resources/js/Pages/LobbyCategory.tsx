import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { router, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useState } from 'react';

import { Calendar } from "@/Components/ui/calendar"
export default function LobbyCategory() {
  const { subjects } = usePage().props;
  const { lobbies, id } = usePage().props;
  const typedId = id as string;
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    id: typedId || '',
    date: ""
  });
  const [date, setDate] = useState<Date | undefined>(new Date())
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('subject.store'), {
      onSuccess: () => {
        reset();
        const dialogClose = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
        if (dialogClose) dialogClose.click();
      },
      onError: (e) => {
        console.log("erroror", e)
      }
    });
  };


  const handleClickCategory = (code: string) => {
    router.get(`/subjectQuestionForm/${code}`)
  }
  const handleStart = (id: string) => {
    router.get(`/lobby/${id}`)
  }
  useEffect(() =>{

    setData("date",date.toLocaleDateString())
  },[date])
  return (
    <AuthenticatedLayout>
      <Head title="Event Rooms Category" />

      <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 min-h-screen">
        <h1 className="text-3xl font-bold text-red-800 mb-8 tracking-tight">All Lobbies with Code  </h1>



        {lobbies?.map((lobby) => (
          <div key={lobby.id} className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg transition duration-300 hover:shadow-xl">
            <h2 className="text-2xl uppercase font-semibold text-red-700 mb-4 flex items-center gap-2">
              {lobby.name}
              <span className="text-2xl font-normal bg-red-100 px-3 py-1 rounded-full text-red-600"><b>Code: </b>{lobby.lobby_code}</span>
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 gap-x-10 mt-5'>
              {lobby.subjects.map(subject => (
                <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group hover:scale-[1.02]'>
                  <div className='bg-gradient-to-r from-red-500 to-red-600 p-4'>
                    <p className='text-white font-medium text-lg'>{subject.subject_name}</p>
                  </div>

                  <div className='p-4  flex gap-x-2'>
                    <Link href={`/lobby/${id}/${subject.id}`}
                      className='w-full bg-gradient-to-r text-center from-red-500 to-red-600 text-white py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow group-hover:scale-[1.02]'
                    >
                      Proceed to Quiz
                    </Link>
                    {/* <Button 
                    onClick={() => handleStart(lobby.id)}
                    className='w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow group-hover:scale-[1.02]'
                  >
                    Start Quiz
                  </Button> */}
                    <Button
                      onClick={() => handleClickCategory(subject.id)}
                      className='w-full border-2 border-red-500 bg-transparent  text-red-600 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 group-hover:scale-[1.02]'
                    >
                      Manage Questions
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {
              lobby?.subjects?.length > 0 ?
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] w-[700px] bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold text-red-700">Add New Subject</DialogTitle>
                        <DialogDescription className="text-red-600/80">
                          Enter the name for your new subject category.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-red-700">Subject Name</Label>
                          <Input
                            id="name"
                            placeholder="Enter subject name"
                            className="border-red-200 focus:border-red-500 focus:ring-red-500"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                          />
                          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-red-700"> Select Start Date</Label>
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow-sm text-lg w-full"
                            captionLayout="dropdown"
                          />

                        </div>
                        <DialogFooter className="mt-6">
                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            {processing ? 'Creating...' : 'Create Subject'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div> :
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="mb-8">
                    <svg className="w-32 h-32 mx-auto text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-red-800 mb-4">
                    No Subjects Yet
                  </h3>

                  <p className="text-red-600 mb-8 max-w-md leading-relaxed">
                    You haven't created any subjects yet. Get started by creating your first subject where participants can join and engage with your quiz.
                  </p>

                  <div className="space-y-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create Your First Subject
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-semibold text-red-700">Create New Lobby</DialogTitle>
                          <DialogDescription className="text-red-600/80">
                            Fill in the details below to create a new lobby.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-red-700">Subject Name</Label>
                            <Input
                              id="name"
                              placeholder="Enter subject name"
                              className="border-red-200 focus:border-red-500 focus:ring-red-500"
                              value={data.name}
                              onChange={e => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                          </div>
                          <DialogFooter className="mt-6">
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              {processing ? 'Creating...' : 'Create Subject'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <div className="flex items-center justify-center space-x-6 pt-4 text-sm text-red-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Quick Setup
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        Easy Management
                      </div>

                    </div>
                  </div>
                </div>
            }

          </div>
        ))}

      </div>

    </AuthenticatedLayout>
  );



}
