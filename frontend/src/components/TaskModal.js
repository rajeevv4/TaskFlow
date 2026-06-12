import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
// import Attachment from '../image/attachment.jpg'
import axios from 'axios'
import toast from 'react-hot-toast'


//first later capital in javascript ?




const TaskModal = ({ isOpen, setIsOpen, id }) => {
    const [taskData, setTaskData] = useState('')

    const capitalizeFirstLetter = (string) => {
        return string ? string.charAt(0).toUpperCase() + string.slice(1) : ''
    }

    useEffect(() => {
        if (isOpen) {
            axios.get(`http://localhost:9000/project/${id.projectId}/task/${id.id}`)
                .then((data) => {
                    setTaskData({ ...data.data[0].task[0] });
                    // console.log(taskData);
                })
                .catch((error) => {
                    toast.error('something went wrong')
                })
        }
    }, [isOpen]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as='div' open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 overflow-y-auto">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>
                    <div className="fixed inset-0 flex items-center justify-center p-4 w-screen h-screen">
                        {/* <div className="fixed inset-0 "> */}
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="rounded-md bg-white max-w-[85%] w-[85%] h-[85%] overflow-y-hidden">

                                <Dialog.Title as='div' className={'bg-white shadow px-6 py-4 rounded-t-md sticky top-0'}>
                                    <h1>Task details</h1>
                                    <button onClick={() => setIsOpen(false)} className='absolute right-6 top-4 text-gray-500 hover:bg-gray-100 rounded focus:outline-none focus:ring focus:ring-offset-1 focus:ring-gray-500/30 '>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dialog.Title>
                                <div className='flex flex-col md:flex-row gap-4 h-[inherit] overflow-y-auto pb-10'>
                                    <div className="w-full md:w-8/12 px-8 space-y-4 py-4 min-h-max">
                                        <h1 className='text-3xl font-bold text-slate-800 tracking-tight capitalize'>{capitalizeFirstLetter(taskData.title)}</h1>
                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h3>
                                            <p className='text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap'>{capitalizeFirstLetter(taskData.description) || "No description provided."}</p>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-4/12 py-4 px-6 md:pr-8 md:pl-0">
                                        <div className='bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4'>
                                            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-200 pb-2">Properties</h3>
                                            
                                            {/* Stage / Status */}
                                            <div>
                                                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Status</span>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    {taskData.stage || 'Requested'}
                                                </span>
                                            </div>

                                            {/* Priority */}
                                            <div>
                                                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Priority</span>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                                                    taskData.priority === 'High' 
                                                        ? 'bg-red-50 text-red-700 border-red-100' 
                                                        : taskData.priority === 'Medium' 
                                                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                    {taskData.priority || 'Medium'}
                                                </span>
                                            </div>

                                            {/* Due Date */}
                                            <div>
                                                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Due Date</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-sm font-medium ${
                                                        taskData.dueDate && taskData.stage !== 'Done' && new Date(taskData.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)
                                                            ? 'text-red-600 font-bold'
                                                            : 'text-slate-700'
                                                    }`}>
                                                        {taskData.dueDate ? new Date(taskData.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No due date'}
                                                    </span>
                                                    {taskData.dueDate && taskData.stage !== 'Done' && new Date(taskData.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Created At */}
                                            {taskData.created_at && (
                                                <div className="border-t border-slate-200 pt-3">
                                                    <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Created On</span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(taskData.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>

                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default TaskModal