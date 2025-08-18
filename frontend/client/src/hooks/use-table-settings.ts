"use client"

import { useState, useEffect } from "react"

export interface ColumnVisibility {
  name: boolean
  email: boolean
  roles: boolean
  phone: boolean
  status: boolean
  lastLogin: boolean
  created: boolean
  actions: boolean
}

interface TableSettings {
  columnVisibility: ColumnVisibility
  pageSize: number
  theme: string
  sortColumn: string | null
  sortDirection: "asc" | "desc" | null
  groupColumn: string | null
}

const DEFAULT_SETTINGS: TableSettings = {
  columnVisibility: {
    name: true,
    email: true,
    roles: true,
    phone: true,
    status: true,
    lastLogin: true,
    created: true,
    actions: true,
  },
  pageSize: 25,
  theme: "system",
  sortColumn: null,
  sortDirection: null,
  groupColumn: null,
}

const STORAGE_KEY = "users-table-settings"

export function useTableSettings() {
  const [settings, setSettings] = useState<TableSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedSettings = JSON.parse(stored)
        // Merge with defaults to handle new settings that might not exist in stored data
        setSettings((prev) => ({ ...prev, ...parsedSettings }))
      }
    } catch (error) {
      console.warn("Failed to load table settings from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return // Don't save until we've loaded initial settings

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.warn("Failed to save table settings to localStorage:", error)
    }
  }, [settings, isLoaded])

  const updateSettings = (updates: Partial<TableSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn("Failed to clear table settings from localStorage:", error)
    }
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
  }
}
