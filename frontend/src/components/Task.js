import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuid } from "uuid";
import AddTaskModal from "./AddTaskModal";
import DropdownMenu from "./DropdownMenu";
// import TaskModal from "./TaskModal";
import { useParams, useNavigate } from "react-router";
import ProjectDropdown from "./ProjectDropdown";
import axios from "axios";
import toast from "react-hot-toast";
import TaskModal from "./TaskModal";

function Task() {
  // const itemsFromBackend = [
  //     { _id: uuid(), content: "First task" },
  //     { _id: uuid(), content: "Second task" },
  //     { _id: uuid(), content: "Third task" },
  //     { _id: uuid(), content: "Forth task" }
  // ];

  // const columnsFromBackend = {
  //     [uuid()]: {
  //         name: "Requested",
  //         items: []
  //     },
  //     [uuid()]: {
  //         name: "To do",
  //         items: []
  //     },
  //     [uuid()]: {
  //         name: "In Progress",
  //         items: []
  //     },
  //     [uuid()]: {
  //         name: "Done",
  //         items: []
  //     }
  // };

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;
    let data = {};
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
      data = {
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      };
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
      data = {
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      };
    }

    updateTodo(data);
  };

  const [isAddTaskModalOpen, setAddTaskModal] = useState(false);

  // const [columns, setColumns] = useState(columnsFromBackend);
  const [columns, setColumns] = useState({});
  const [isRenderChange, setRenderChange] = useState(false);
  const [isTaskOpen, setTaskOpen] = useState(false);
  const [taskId, setTaskId] = useState(false);
  const [title, setTitle] = useState("");
  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAddTaskModalOpen || isRenderChange) {
      axios
        .get(`http://https://taskflow-lfo7.onrender.com/project/${projectId}`)
        .then((res) => {
          setTitle(res.data[0].title);
          setColumns({
            [uuid()]: {
              name: "Requested",
              items: res.data[0].task
                .filter((task) => task.stage === "Requested")
                .sort((a, b) => {
                  return a.order - b.order;
                }),
            },
            [uuid()]: {
              name: "To do",
              items: res.data[0].task
                .filter((task) => task.stage === "To do")
                .sort((a, b) => {
                  return a.order - b.order;
                }),
            },
            [uuid()]: {
              name: "In Progress",
              items: res.data[0].task
                .filter((task) => task.stage === "In Progress")
                .sort((a, b) => {
                  return a.order - b.order;
                }),
            },
            [uuid()]: {
              name: "Done",
              items: res.data[0].task
                .filter((task) => task.stage === "Done")
                .sort((a, b) => {
                  return a.order - b.order;
                }),
            },
          });
          setRenderChange(false);
          // Notify sidebar to refresh task counts and activities
          document.dispatchEvent(new CustomEvent("projectUpdate"));
        })
        .catch((error) => {
          toast.error("Something went wrong");
        });
    }
  }, [projectId, isAddTaskModalOpen, isRenderChange]);

  const updateTodo = (data) => {
    axios
      .put(
        `http://https://taskflow-lfo7.onrender.com/project/${projectId}/todo`,
        data
      )
      .then((res) => {
        setRenderChange(true);
      })
      .catch((error) => {
        toast.error("Something went wrong");
      });
  };

  const handleDelete = (e, taskId) => {
    e.stopPropagation();
    axios
      .delete(
        `http://https://taskflow-lfo7.onrender.com/project/${projectId}/task/${taskId}`
      )
      .then((res) => {
        toast.success("Task is deleted");
        setRenderChange(true);
      })
      .catch((error) => {
        console.error("Task: delete error", error);
        toast.error("Something went wrong");
      });
  };

  const handleTaskDetails = (id) => {
    setTaskId({ projectId, id });
    setTaskOpen(true);
  };

  const handleExportReport = async () => {
    try {
      const res = await axios.get(
        `http://https://taskflow-lfo7.onrender.com/project/${projectId}/report`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `TaskFlow-Report-${title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report exported successfully");
    } catch (err) {
      console.error("Task: Export report error", err);
      toast.error("Failed to export report");
    }
  };

  // Calculate statistics for header
  let totalTasks = 0;
  let completedTasks = 0;
  let pendingTasks = 0;

  if (columns && Object.keys(columns).length > 0) {
    Object.values(columns).forEach((column) => {
      if (column && column.items) {
        totalTasks += column.items.length;
        if (column.name === "Done") {
          completedTasks += column.items.length;
        } else {
          pendingTasks += column.items.length;
        }
      }
    });
  }

  return (
    <div className="px-6 md:px-8 py-6 w-full flex flex-col h-[calc(100vh-56px)] bg-slate-50/30 overflow-hidden">
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center space-x-2.5 capitalize">
            <span>{title}</span>
          </h1>
          <ProjectDropdown id={projectId} navigate={navigate} />
        </div>

        <div className="flex items-center space-x-3">
          {/* Stats summary */}
          <div className="hidden md:flex items-center space-x-2 text-xs font-semibold">
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              Tasks: {totalTasks}
            </span>
            <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
              Completed: {completedTasks}
            </span>
            <span className="px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
              Pending: {pendingTasks}
            </span>
          </div>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg shadow-sm border border-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            <span>Export Report</span>
          </button>

          <button
            onClick={() => setAddTaskModal(true)}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Small stats for mobile */}
      <div className="flex md:hidden items-center space-x-2 text-[10px] font-bold mb-4">
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
          Tasks: {totalTasks}
        </span>
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
          Completed: {completedTasks}
        </span>
        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-100">
          Pending: {pendingTasks}
        </span>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex-1 flex flex-col min-h-0 pr-1 w-full mt-2">
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
        >
          <div className="flex flex-row overflow-x-auto gap-5 pb-6 scroll-smooth snap-x snap-mandatory h-full">
            {Object.entries(columns).map(([columnId, column]) => {
              return (
                <div
                  className="w-[280px] sm:w-[320px] lg:w-auto lg:flex-1 shrink-0 lg:shrink flex flex-col h-full bg-slate-50/50 rounded-xl p-3 border border-slate-200/60 snap-center md:snap-align-none"
                  key={columnId}
                >
                  <div className="pb-3 w-full flex justify-between items-center px-1">
                    <div className="inline-flex items-center space-x-2">
                      <h2 className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                        {column.name}
                      </h2>
                      <span
                        className={`h-5 w-5 inline-flex items-center justify-center rounded-full text-[10px] font-bold ${
                          column.name === "Done"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        } ${column.items.length < 1 && "invisible"}`}
                      >
                        {column.items?.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                    <Droppable droppableId={columnId} key={columnId}>
                      {(provided, snapshot) => {
                        return (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`h-full min-h-[150px] pt-1 duration-75 transition-colors border-t border-indigo-400/30 ${
                              snapshot.isDraggingOver &&
                              "bg-slate-100/40 rounded-b-lg"
                            }`}
                          >
                            {column.items.map((item, index) => {
                              const isOverdue =
                                item.dueDate &&
                                item.stage !== "Done" &&
                                new Date(item.dueDate).setHours(0, 0, 0, 0) <
                                  new Date().setHours(0, 0, 0, 0);
                              return (
                                <Draggable
                                  key={item._id}
                                  draggableId={item._id}
                                  index={index}
                                >
                                  {(provided, snapshot) => {
                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          ...provided.draggableProps.style,
                                        }}
                                        onClick={() =>
                                          handleTaskDetails(item._id)
                                        }
                                        className={`select-none p-4 mb-3 border border-slate-200 hover:border-slate-300 rounded-lg shadow-xs hover:shadow-sm bg-white relative transition cursor-pointer ${
                                          snapshot.isDragging &&
                                          "shadow-md border-indigo-300"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <h3 className="text-slate-800 font-semibold text-sm capitalize line-clamp-2 leading-snug">
                                            {item.title}
                                          </h3>
                                          <DropdownMenu
                                            taskId={item._id}
                                            handleDelete={handleDelete}
                                            projectId={projectId}
                                            setRenderChange={setRenderChange}
                                          />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-normal mt-1 mb-3 line-clamp-2 capitalize">
                                          {item.description}
                                        </p>

                                        {/* Card footer details */}
                                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[10px]">
                                          <span className="font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            T-{item.index}
                                          </span>
                                          <div className="flex items-center space-x-1.5">
                                            {/* Priority badge */}
                                            <span
                                              className={`px-2 py-0.5 rounded-full font-semibold border ${
                                                item.priority === "High"
                                                  ? "bg-red-50 text-red-600 border-red-100"
                                                  : item.priority === "Medium"
                                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                                  : "bg-slate-100 text-slate-500 border-slate-200"
                                              }`}
                                            >
                                              {item.priority || "Medium"}
                                            </span>

                                            {/* Due Date badge */}
                                            {item.dueDate && (
                                              <span
                                                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border ${
                                                  isOverdue
                                                    ? "bg-red-50 text-red-600 border-red-100 font-bold"
                                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                                }`}
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  strokeWidth={2.5}
                                                  stroke="currentColor"
                                                  className="w-3 h-3"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                                  />
                                                </svg>
                                                <span>
                                                  {new Date(
                                                    item.dueDate
                                                  ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                      month: "short",
                                                      day: "numeric",
                                                    }
                                                  )}
                                                </span>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        );
                      }}
                    </Droppable>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
      <AddTaskModal
        isAddTaskModalOpen={isAddTaskModalOpen}
        setAddTaskModal={setAddTaskModal}
        projectId={projectId}
        refreshData={setRenderChange}
      />
      <TaskModal isOpen={isTaskOpen} setIsOpen={setTaskOpen} id={taskId} />
    </div>
  );
}

export default Task;
