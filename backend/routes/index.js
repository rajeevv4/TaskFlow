import express from 'express';
import joi from 'joi';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Project from '../models/index.js';
import Activity from '../models/activity.js';
import User from '../models/user.js';
import auth from '../middleware/auth.js';

const api = express.Router();

// ==========================================
// USER AUTHENTICATION ENDPOINTS
// ==========================================

// User Registration
api.post('/signup', async (req, res) => {
    const signupSchema = joi.object({
        name: joi.string().min(2).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
    });

    const { error, value } = signupSchema.validate(req.body);
    if (error) {
        return res.status(422).send({ error: true, message: error.details[0].message.replace(/"/g, '') });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email: value.email.toLowerCase() });
        if (existingUser) {
            return res.status(422).send({ error: true, message: 'Email is already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(value.password, salt);

        // Save new user
        const newUser = await new User({
            name: value.name,
            email: value.email.toLowerCase(),
            password: hashedPassword
        }).save();

        // Generate JWT
        const token = jwt.sign(
            { userId: newUser._id, name: newUser.name, email: newUser.email },
            process.env.JWT_SECRET || 'super_secret_taskflow_key_9988',
            { expiresIn: '7d' }
        );

        return res.status(201).send({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (e) {
        console.error("POST /signup error:", e);
        return res.status(500).send({ error: true, message: 'Server error during signup' });
    }
});

// User Login
api.post('/login', async (req, res) => {
    const loginSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required(),
    });

    const { error, value } = loginSchema.validate(req.body);
    if (error) {
        return res.status(422).send({ error: true, message: error.details[0].message.replace(/"/g, '') });
    }

    try {
        const user = await User.findOne({ email: value.email.toLowerCase() });
        if (!user) {
            return res.status(401).send({ error: true, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(value.password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: true, message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET || 'super_secret_taskflow_key_9988',
            { expiresIn: '7d' }
        );

        return res.send({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (e) {
        console.error("POST /login error:", e);
        return res.status(500).send({ error: true, message: 'Server error during login' });
    }
});

// ==========================================
// PROTECTED PROJECT ENDPOINTS
// ==========================================

// Get all projects with task info
api.get('/projects', auth, async (req, res) => {
    try {
        // Return tasks scoped by the logged-in user
        const data = await Project.find({ userId: req.user.userId }, { __v: 0, updatedAt: 0 })
        return res.send(data)
    } catch (error) {
        console.error("GET /projects error:", error);
        return res.status(500).send({ error: true, message: 'Failed to retrieve projects' })
    }
})

// Get single project details
api.get('/project/:id', auth, async (req, res) => {
    if (!req.params.id) {
        return res.status(422).send({ error: true, message: 'Project ID is required' })
    }
    try {
        const data = await Project.find({ _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId }).sort({ order: 1 })
        if (!data || data.length === 0) {
            return res.status(404).send({ error: true, message: 'Project not found' })
        }
        return res.send(data)
    } catch (error) {
        console.error("GET /project/:id error:", error);
        return res.status(500).send({ error: true, message: 'Failed to retrieve project details' })
    }
})

// Create a new project
api.post('/project', auth, async (req, res) => {
    const projectSchema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
    })

    const { error, value } = projectSchema.validate({ title: req.body.title, description: req.body.description });
    if (error) {
        return res.status(422).send({ error: true, message: error.details[0].message.replace(/"/g, '') })
    }

    try {
        const data = await new Project({
            ...value,
            userId: req.user.userId
        }).save()
        // Log activity
        await new Activity({
            projectId: data._id,
            message: `Project created`
        }).save()
        return res.send({ data: { title: data.title, description: data.description, updatedAt: data.updatedAt, _id: data._id } })
    } catch (e) {
        if (e.code === 11000) {
            return res.status(422).send({ error: true, message: 'Project title must be unique' })
        } else {
            console.error("POST /project error:", e);
            return res.status(500).send({ error: true, message: 'Server error occurred while creating project' })
        }
    }
})

// Update a project
api.put('/project/:id', auth, async (req, res) => {
    if (!req.params.id) {
        return res.status(422).send({ error: true, message: 'Project ID is required' })
    }

    const projectSchema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
    })

    const { error, value } = projectSchema.validate({ title: req.body.title, description: req.body.description });
    if (error) {
        return res.status(422).send({ error: true, message: error.details[0].message.replace(/"/g, '') })
    }

    try {
        const data = await Project.updateOne({ _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId }, { ...value })
        if (data.matchedCount === 0) {
            return res.status(404).send({ error: true, message: 'Project not found or unauthorized' })
        }
        return res.send(data)
    } catch (e) {
        if (e.code === 11000) {
            return res.status(422).send({ error: true, message: 'Project title must be unique' })
        } else {
            console.error("PUT /project/:id error:", e);
            return res.status(500).send({ error: true, message: 'Server error occurred while updating project' })
        }
    }
})

// Delete a project
api.delete('/project/:id', auth, async (req, res) => {
    if (!req.params.id) {
        return res.status(422).send({ error: true, message: 'Project ID is required' })
    }
    try {
        const data = await Project.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId })
        if (data.deletedCount === 0) {
            return res.status(404).send({ error: true, message: 'Project not found or unauthorized' })
        }
        // Delete project's activities
        await Activity.deleteMany({ projectId: new mongoose.Types.ObjectId(req.params.id) })
        return res.send(data)
    } catch (error) {
        console.error("DELETE /project/:id error:", error);
        return res.status(500).send({ error: true, message: 'Failed to delete project' })
    }
})

// ==========================================
// PROTECTED TASK ENDPOINTS
// ==========================================

// Create a new task in a project
api.post('/project/:id/task', auth, async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ error: true, message: 'Project ID is required' });
    }

    const taskSchema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
        priority: joi.string().valid('Low', 'Medium', 'High').default('Medium'),
        dueDate: joi.date().iso().allow(null, '').optional(),
    })

    const { error, value } = taskSchema.validate({
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        dueDate: req.body.dueDate
    });
    if (error) {
        return res.status(422).send({ error: true, message: error.details[0].message.replace(/"/g, '') })
    }

    try {
        const [project] = await Project.find({ _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId }, { "task.index": 1 })
        if (!project) {
            return res.status(404).send({ error: true, message: 'Project not found or unauthorized' })
        }

        const taskList = project.task || [];
        let countTaskLength = [
            taskList.length,
            taskList.length > 0 ? Math.max(...taskList.map(o => o.index || 0)) : 0
        ];

        const newTask = {
            ...value,
            stage: "Requested",
            order: countTaskLength[0],
            index: countTaskLength[1] + 1
        };

        const data = await Project.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId },
            { $push: { task: newTask } }
        )
        // Log activity
        await new Activity({
            projectId: req.params.id,
            message: `Task "${newTask.title}" created`
        }).save()
        return res.send(data)
    } catch (error) {
        console.error("POST /project/:id/task error:", error);
        return res.status(500).send({ error: true, message: 'Failed to create task' })
    }
})

// Get details of a single task
api.get('/project/:id/task/:taskId', auth, async (req, res) => {
    if (!req.params.id || !req.params.taskId) {
        return res.status(400).send({ error: true, message: 'Project ID and Task ID are required' });
    }

    try {
        let data = await Project.find(
            { _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId },
            {
                task: {
                    $filter: {
                        input: "$task",
                        as: "task",
                        cond: {
                            $eq: ["$$task._id", new mongoose.Types.ObjectId(req.params.taskId)]
                        }
                    }
                }
            })
        if (!data || data.length < 1 || data[0].task.length < 1) {
            return res.status(404).send({ error: true, message: 'Task not found or unauthorized' })
        }
        return res.send(data)
    } catch (error) {
        console.error("GET /project/:id/task/:taskId error:", error);
        return res.status(500).send({ error: true, message: 'Failed to retrieve task' })
    }
})

// Update details of a task
api.put('/project/:id/task/:taskId', auth, async (req, res) => {
    if (!req.params.id || !req.params.taskId) {
        return res.status(400).send({ error: true, message: 'Project ID and Task ID are required' });
    }

    const taskSchema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
        priority: joi.string().valid('Low', 'Medium', 'High').default('Medium'),
        dueDate: joi.date().iso().allow(null, '').optional(),
    })

    const { error, value } = taskSchema.validate({
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        dueDate: req.body.dueDate
    });
    if (error) {
        return res.status(422).send({ error: true, message: error.details[0].message.replace(/"/g, '') })
    }

    try {
        const [project] = await Project.find(
            { _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId },
            {
                task: {
                    $filter: {
                        input: "$task",
                        as: "task",
                        cond: {
                            $eq: ["$$task._id", new mongoose.Types.ObjectId(req.params.taskId)]
                        }
                    }
                }
            }
        )
        if (!project || project.task.length === 0) {
            return res.status(404).send({ error: true, message: 'Task not found or unauthorized' })
        }
        const prevTask = project.task[0];

        const data = await Project.updateOne({
            _id: new mongoose.Types.ObjectId(req.params.id),
            userId: req.user.userId,
            task: { $elemMatch: { _id: new mongoose.Types.ObjectId(req.params.taskId) } }
        }, {
            $set: {
                "task.$.title": value.title,
                "task.$.description": value.description,
                "task.$.priority": value.priority,
                "task.$.dueDate": value.dueDate
            }
        })

        // Log activities based on changes
        let activitiesToSave = [];
        const taskName = value.title;

        if (prevTask.priority !== value.priority) {
            activitiesToSave.push(new Activity({
                projectId: req.params.id,
                message: `Task "${taskName}" priority changed to ${value.priority}`
            }).save());
        }

        const prevDate = prevTask.dueDate ? new Date(prevTask.dueDate).toISOString().split('T')[0] : null;
        const newDate = value.dueDate ? new Date(value.dueDate).toISOString().split('T')[0] : null;
        if (prevDate !== newDate) {
            const dateStr = newDate ? newDate : 'None';
            activitiesToSave.push(new Activity({
                projectId: req.params.id,
                message: `Task "${taskName}" due date updated to ${dateStr}`
            }).save());
        }

        if (prevTask.title !== value.title || prevTask.description !== value.description) {
            activitiesToSave.push(new Activity({
                projectId: req.params.id,
                message: `Task "${taskName}" updated`
            }).save());
        }

        if (activitiesToSave.length > 0) {
            await Promise.all(activitiesToSave);
        }

        return res.send(data)
    } catch (error) {
        console.error("PUT /project/:id/task/:taskId error:", error);
        return res.status(500).send({ error: true, message: 'Failed to update task' })
    }
})

// Delete a task
api.delete('/project/:id/task/:taskId', auth, async (req, res) => {
    if (!req.params.id || !req.params.taskId) {
        return res.status(400).send({ error: true, message: 'Project ID and Task ID are required' });
    }

    try {
        const [project] = await Project.find(
            { _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId },
            {
                task: {
                    $filter: {
                        input: "$task",
                        as: "task",
                        cond: {
                            $eq: ["$$task._id", new mongoose.Types.ObjectId(req.params.taskId)]
                        }
                    }
                }
            }
        )
        if (!project || project.task.length === 0) {
            return res.status(404).send({ error: true, message: 'Task not found or unauthorized' })
        }
        const taskTitle = project.task[0].title;

        const data = await Project.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId },
            { $pull: { task: { _id: new mongoose.Types.ObjectId(req.params.taskId) } } }
        )

        // Log activity
        await new Activity({
            projectId: req.params.id,
            message: `Task "${taskTitle}" deleted`
        }).save()

        return res.send(data)
    } catch (error) {
        console.error("DELETE /project/:id/task/:taskId error:", error);
        return res.status(500).send({ error: true, message: 'Failed to delete task' })
    }
})

// Reorder tasks or change status stage
api.put('/project/:id/todo', auth, async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ error: true, message: 'Project ID is required' });
    }
    
    let todo = []

    for (const key in req.body) {
        for (const index in req.body[key].items) {
            req.body[key].items[index].stage = req.body[key].name
            todo.push({
                name: req.body[key].items[index]._id,
                stage: req.body[key].items[index].stage,
                order: index
            })
        }
    }

    try {
        const [currentProject] = await Project.find({ _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId }, { task: 1 })
        if (!currentProject) {
            return res.status(404).send({ error: true, message: 'Project not found or unauthorized' })
        }
        const currentStages = {};
        const taskTitles = {};
        if (currentProject.task) {
            currentProject.task.forEach(t => {
                currentStages[t._id.toString()] = t.stage;
                taskTitles[t._id.toString()] = t.title;
            });
        }

        await Promise.all(todo.map(async (item) => {
            await Project.updateOne({
                _id: new mongoose.Types.ObjectId(req.params.id),
                userId: req.user.userId,
                task: { $elemMatch: { _id: new mongoose.Types.ObjectId(item.name) } }
            }, {
                $set: {
                    "task.$.order": item.order,
                    "task.$.stage": item.stage
                }
            })
        }))

        // Log stage transitions
        let activitiesToSave = [];
        todo.forEach(item => {
            const taskIdStr = item.name.toString();
            const prevStage = currentStages[taskIdStr];
            const newStage = item.stage;
            if (prevStage && prevStage !== newStage) {
                const taskTitle = taskTitles[taskIdStr] || 'Unknown';
                activitiesToSave.push(new Activity({
                    projectId: req.params.id,
                    message: `Task "${taskTitle}" moved from ${prevStage} to ${newStage}`
                }).save());
            }
        });

        if (activitiesToSave.length > 0) {
            await Promise.all(activitiesToSave);
        }

        return res.send(todo)
    } catch (error) {
        console.error("PUT /project/:id/todo error:", error);
        return res.status(500).send({ error: true, message: 'Failed to save task arrangement' })
    }
})

// ==========================================
// PROTECTED REPORT & ACTIVITY ENDPOINTS
// ==========================================

// Export Project Report as CSV
api.get('/project/:id/report', auth, async (req, res) => {
    if (!req.params.id) {
        return res.status(422).send({ error: true, message: 'Project ID is required' })
    }

    try {
        const [project] = await Project.find({ _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId })
        if (!project) {
            return res.status(404).send({ error: true, message: 'Project not found or unauthorized' })
        }

        const tasks = project.task || []
        const totalTasks = tasks.length
        const completedTasks = tasks.filter(t => t.stage === 'Done').length
        const pendingTasks = totalTasks - completedTasks
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        // Helper to escape CSV values
        const escapeCSV = (str) => {
            if (str === undefined || str === null) return '';
            const s = String(str);
            if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        }

        // Format dates
        const formatDate = (date) => {
            if (!date) return '';
            return new Date(date).toISOString().split('T')[0];
        }

        // Build CSV contents
        let csv = '';

        // Section 1: Project Information
        csv += `Project Information\n`;
        csv += `Project Name,${escapeCSV(project.title)}\n`;
        csv += `Project Description,${escapeCSV(project.description)}\n`;
        csv += `Created Date,${formatDate(project.createdAt || project.updatedAt)}\n\n`;

        // Section 2: Project Summary
        csv += `Project Summary\n`;
        csv += `Total Tasks,Completed Tasks,Pending Tasks,Completion Percentage\n`;
        csv += `${totalTasks},${completedTasks},${pendingTasks},${completionPercentage}%\n\n`;

        // Section 3: Task Details
        csv += `Task Details\n`;
        csv += `Task Title,Status,Priority,Due Date,Completion Status\n`;
        
        tasks.forEach(task => {
            const isCompleted = task.stage === 'Done' ? 'Completed' : 'Pending';
            csv += `${escapeCSV(task.title)},${escapeCSV(task.stage)},${escapeCSV(task.priority || 'Medium')},${formatDate(task.dueDate)},${isCompleted}\n`;
        });

        // Set response headers to force download
        const fileName = `TaskFlow-Report-${project.title.replace(/[^a-zA-Z0-9]/g, '_')}-${formatDate(new Date())}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        return res.status(200).send(csv);

    } catch (error) {
        console.error("GET /project/:id/report error:", error);
        return res.status(500).send({ error: true, message: 'Failed to generate project report' })
    }
})

// Get recent activities for a project
api.get('/project/:id/activity', auth, async (req, res) => {
    if (!req.params.id) {
        return res.status(422).send({ error: true, message: 'Project ID is required' })
    }
    try {
        const project = await Project.findOne({ _id: new mongoose.Types.ObjectId(req.params.id), userId: req.user.userId })
        if (!project) {
            return res.status(404).send({ error: true, message: 'Project not found or unauthorized' })
        }

        const data = await Activity.find({ projectId: new mongoose.Types.ObjectId(req.params.id) })
            .sort({ createdAt: -1 })
            .limit(10)
        return res.send(data)
    } catch (error) {
        console.error("GET /project/:id/activity error:", error);
        return res.status(500).send({ error: true, message: 'Failed to retrieve recent activities' })
    }
})

export default api;