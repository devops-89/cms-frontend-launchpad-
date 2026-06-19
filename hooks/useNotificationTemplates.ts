"use client";
import { useState, useEffect } from "react";

export interface EmailTemplate {
  id: string;
  audience: "Participant" | "Judge";
  eventType: string;
  subject: string;
  body: string;
}

const LOCAL_STORAGE_KEY = "mock_notification_templates_v2";

// These will be loaded if localStorage is empty
const defaultTemplates: EmailTemplate[] = [
  {
    id: "1",
    audience: "Participant",
    eventType: "Registration Successful",
    subject: "Welcome to the Contest!",
    body: "Hi {{user_name}},\n\nThank you for registering for {{contest_name}}! We are thrilled to have you on board.\n\nYou can view your dashboard for more updates.",
  },
  {
    id: "2",
    audience: "Participant",
    eventType: "Entry Submitted",
    subject: "Your Entry was received",
    body: "Hi {{user_name}},\n\nWe have successfully received your entry: {{entry_title}} for the contest.\n\nGood luck!",
  },
];

export const useNotificationTemplates = () => {
  const [templates, setTemplatesState] = useState<EmailTemplate[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setTemplatesState(JSON.parse(stored));
      } catch (e) {
        setTemplatesState(defaultTemplates);
      }
    } else {
      setTemplatesState(defaultTemplates);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultTemplates));
    }
  }, []);

  const saveTemplates = (newTemplates: EmailTemplate[]) => {
    setTemplatesState(newTemplates);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTemplates));
  };

  const addTemplate = (template: EmailTemplate) => {
    saveTemplates([...templates, template]);
  };

  const updateTemplate = (id: string, updatedFields: Partial<EmailTemplate>) => {
    saveTemplates(templates.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const deleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
  };

  const getTemplate = (id: string) => templates.find(t => t.id === id);

  return { templates, addTemplate, updateTemplate, deleteTemplate, getTemplate };
};
