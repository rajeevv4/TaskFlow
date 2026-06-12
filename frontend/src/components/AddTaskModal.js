import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import BtnPrimary from "./BtnPrimary";
import BtnSecondary from "./BtnSecondary";
import axios from "axios";
import toast from "react-hot-toast";

const AddTaskModal = ({
  isAddTaskModalOpen,
  setAddTaskModal,
  projectId = null,
  taskId = null,
  edit = false,
  refreshData,
}) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (edit && isAddTaskModalOpen) {
      axios
        .get(
          `https://taskflow-lfo7.onrender.com/project/${projectId}/task/${taskId}`
        )
        .then((res) => {
          const task = res.data[0].task[0];
          setTitle(task.title);
          setDesc(task.description);
          setPriority(task.priority || "Medium");
          setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
        })
        .catch((error) => {
          console.error("AddTaskModal: edit fetch error", error);
          toast.error("Something went wrong");
        });
      console.log("edit function call");
    } else {
      setTitle("");
      setDesc("");
      setPriority("Medium");
      setDueDate("");
    }
  }, [isAddTaskModalOpen, edit, projectId, taskId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title,
      description: desc,
      priority,
      dueDate: dueDate || null,
    };

    if (!edit) {
      axios
        .post(
          `https://taskflow-lfo7.onrender.com/project/${projectId}/task`,
          payload
        )
        .then((res) => {
          setAddTaskModal(false);
          toast.success("Task created successfully");
          setTitle("");
          setDesc("");
          setPriority("Medium");
          setDueDate("");
          if (refreshData) refreshData(true);
        })
        .catch((error) => {
          if (error.response && error.response.status === 422) {
            toast.error(error.response.data.message || "Validation error");
          } else {
            toast.error("Something went wrong");
          }
        });
    } else {
      axios
        .put(
          `https://taskflow-lfo7.onrender.com/project/${projectId}/task/${taskId}`,
          payload
        )
        .then((res) => {
          setAddTaskModal(false);
          toast.success("Task is updated");
          setTitle("");
          setDesc("");
          setPriority("Medium");
          setDueDate("");
          if (refreshData) refreshData(true);
        })
        .catch((error) => {
          if (error.response && error.response.status === 422) {
            toast.error(error.response.data.message || "Validation error");
          } else {
            toast.error("Something went wrong");
          }
        });
    }
  };

  return (
    <Transition appear show={isAddTaskModalOpen} as={Fragment}>
      <Dialog
        as="div"
        open={isAddTaskModalOpen}
        onClose={() => setAddTaskModal(false)}
        className="relative z-50"
      >
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
              <Dialog.Panel className="rounded-md bg-white w-11/12 sm:w-8/12 md:w-6/12 max-w-lg">
                <Dialog.Title
                  as="div"
                  className={
                    "bg-white shadow px-6 py-4 rounded-t-md sticky top-0"
                  }
                >
                  {!edit ? <h1>Add Task</h1> : <h1>Edit Task</h1>}
                  <button
                    onClick={() => setAddTaskModal(false)}
                    className="absolute right-6 top-4 text-gray-500 hover:bg-gray-100 rounded focus:outline-none focus:ring focus:ring-offset-1 focus:ring-indigo-200 "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="gap-4 px-8 py-4">
                  <div className="mb-3">
                    <label
                      htmlFor="title"
                      className="block text-gray-600 text-sm font-medium mb-1"
                    >
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      type="text"
                      className="border border-gray-300 rounded-md w-full text-sm py-2 px-2.5 focus:border-indigo-500 focus:outline-offset-1 focus:outline-indigo-400"
                      placeholder="Task title"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="Description"
                      className="block text-gray-600 text-sm font-medium mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="border border-gray-300 rounded-md w-full text-sm py-2 px-2.5 focus:border-indigo-500 focus:outline-offset-1 focus:outline-indigo-400"
                      rows="4"
                      placeholder="Task description"
                      required
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="priority"
                        className="block text-gray-600 text-sm font-medium mb-1"
                      >
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="border border-slate-300 rounded-md w-full text-sm py-2 px-2.5 focus:border-indigo-500 focus:outline-indigo-400 bg-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="dueDate"
                        className="block text-gray-600 text-sm font-medium mb-1"
                      >
                        Due Date
                      </label>
                      <input
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        type="date"
                        className="border border-slate-300 rounded-md w-full text-sm py-2 px-2.5 focus:border-indigo-500 focus:outline-indigo-400"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end items-center space-x-2">
                    <BtnSecondary onClick={() => setAddTaskModal(false)}>
                      Cancel
                    </BtnSecondary>
                    <BtnPrimary>Save</BtnPrimary>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddTaskModal;
