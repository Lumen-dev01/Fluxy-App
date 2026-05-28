// =============================================
// SUPABASE SERVICES
//
// This file contains all database functions.
// Instead of writing Supabase queries directly in components,
// we put them here so code is reusable and organized.
//
// Think of this as the "data layer" of the app.
// =============================================

import { supabase } from '../lib/supabase'

// =================== PROJECTS ===================

export const projectService = {
  // Get all projects the user is a member of
  async getAll(userId) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_members!inner(user_id, role),
        tasks(count)
      `)
      .eq('project_members.user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get single project by ID
  async getById(projectId) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_members(user_id, role, profiles(id, full_name, avatar_url, email)),
        tasks(*)
      `)
      .eq('id', projectId)
      .single()

    if (error) throw error
    return data
  },

  // Create a new project
  async create(projectData, userId) {
    // First create the project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        owner_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Auto-add the creator as owner member
    await supabase.from('project_members').insert({
      project_id: project.id,
      user_id: userId,
      role: 'owner',
    })

    return project
  },

  // Update a project
  async update(projectId, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a project
  async delete(projectId) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) throw error
  },
}

// =================== TASKS ===================

export const taskService = {
  // Get tasks for a specific project
  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        profiles:assigned_to(id, full_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get all tasks assigned to a user
  async getByUser(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects(id, name, color),
        profiles:assigned_to(id, full_name, avatar_url)
      `)
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get today's tasks for a user
  async getToday(userId) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, projects(id, name, color)`)
      .eq('assigned_to', userId)
      .gte('due_date', today)
      .lt('due_date', today + 'T23:59:59')
      .order('priority', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create a task
  async create(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a task
  async update(taskId, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a task
  async delete(taskId) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) throw error
  },
}

// =================== INVITATIONS ===================
// =================== INVITATIONS ===================

export const invitationService = {
  async create({ projectId, email, inviterId, role = 'member' }) {
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Save invitation to database
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        project_id: projectId,
        email: email.toLowerCase().trim(),
        inviter_id: inviterId,
        role,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Send email via EmailJS
    const inviteLink = `${window.location.origin}/invite/${token}`

    try {
      const emailjs = await import('@emailjs/browser')

      await emailjs.default.send(
        'service_iodaxc8',
        'template_ic53bwb',
        {
          to_email: email.toLowerCase().trim(),
          invite_link: inviteLink,
        },
        'jyUNPysJrxjpHd7_Z'
      )

      console.log('✅ Invitation email sent to:', email)
    } catch (emailErr) {
      console.error('❌ Email failed:', emailErr)
    }

    return data
  },

  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async cancel(invitationId) {
    const { error } = await supabase
      .from('invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)
    if (error) throw error
  },
}

// =================== NOTIFICATIONS ===================

export const notificationService = {
  // Get notifications for a user
  async getAll(userId, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  // Mark a notification as read
  async markRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error
  },

  // Mark all as read
  async markAllRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)

    if (error) throw error
  },

  // Create a notification
  async create({ userId, title, message, type = 'info' }) {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
    })
    if (error) throw error
  },
}

// =================== FILE UPLOAD ===================

export const uploadService = {
  // Upload a profile avatar
  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Replace existing file
      })

    if (error) throw error

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return publicUrl
  },

  // Upload a task attachment
  async uploadAttachment(projectId, file, onProgress) {
    const fileName = `${projectId}/${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(fileName)

    return { path: data.path, url: publicUrl, name: file.name, size: file.size }
  },
}

// =================== ANALYTICS ===================

export const analyticsService = {
  // Get dashboard stats for a user
  async getDashboardStats(userId) {
    const today = new Date().toISOString().split('T')[0]

    // Run multiple queries in parallel for speed
    const [tasksResult, projectsResult] = await Promise.all([
      supabase
        .from('tasks')
        .select('status, priority, due_date')
        .eq('assigned_to', userId),
      supabase
        .from('project_members')
        .select('projects(id, status)')
        .eq('user_id', userId),
    ])

    const tasks = tasksResult.data || []
    const projects = projectsResult.data || []

    const completed = tasks.filter(t => t.status === 'done').length
    const total = tasks.length
    const dueTodayCount = tasks.filter(t => t.due_date?.startsWith(today)).length
    const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length

    return {
      tasksDueToday: dueTodayCount,
      completedTasks: completed,
      ongoingProjects: projects.length,
      productivityScore: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalTasks: total,
      pendingTasks: total - completed,
      highPriorityTasks: highPriority,
    }
  },
}
