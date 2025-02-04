/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Resource management
 */

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: A single resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resource'
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /resources/{id}:
 *   patch:
 *     summary: Update a resource by ID
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resource'
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */

const { auth } = require("../utils/jwt");
const Resource = require("../class/resource");

const express = require('express');
const router = express.Router();

// 获取所有资源
router.get('/resources', auth, async (req, res) => {
    try {
        const resources = await Resource.getAll();
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 获取单个资源
router.get('/resources/:id', auth, async (req, res) => {
    try {
        const resource = await Resource.getById(req.params.id);
        if (resource == null) {
            return res.status(404).json({ message: 'Cannot find resource' });
        }
        res.json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 创建新资源
router.post('/resources', auth, async (req, res) => {
    const resource = new Resource({
        name: req.body.name,
        description: req.body.description
    });

    try {
        const newResource = await resource.save();
        res.status(201).json(newResource);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 更新资源
router.patch('/resources/:id', auth, async (req, res) => {
    try {
        const resource = await Resource.getById(req.params.id);
        if (resource == null) {
            return res.status(404).json({ message: 'Cannot find resource' });
        }

        if (req.body.name != null) {
            resource.name = req.body.name;
        }
        if (req.body.description != null) {
            resource.description = req.body.description;
        }

        const updatedResource = await resource.save();
        res.json(updatedResource);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 删除资源
router.delete('/resources/:id', auth, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (resource == null) {
            return res.status(404).json({ message: 'Cannot find resource' });
        }

        await resource.remove();
        res.json({ message: 'Deleted Resource' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;