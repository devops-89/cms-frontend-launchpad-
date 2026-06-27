"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { contestControllers } from "@/api/contestControllers";

export interface EmailTemplate {
  id: string;
  audience: "Participant" | "Judge";
  eventType: string;
  subject: string;
  body: string;
}

export const useNotificationTemplates = () => {
  const params = useParams();
  const contestId = params?.id as string;
  
  const [templates, setTemplatesState] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapApiToTemplate = (apiData: any): EmailTemplate => {
    // Capitalize audience: "participant" -> "Participant"
    const audienceStr = apiData.audience || "participant";
    const mappedAudience = (audienceStr.charAt(0).toUpperCase() + audienceStr.slice(1)) as "Participant" | "Judge";
    
    // Pass event_type directly as it now matches TEMPLATE_EVENT_TYPE
    const mappedEventType = apiData.event_type || "";

    return {
      id: apiData.id,
      audience: mappedAudience,
      eventType: mappedEventType,
      subject: apiData.subject || "",
      body: apiData.body || "",
    };
  };

  const mapTemplateToApi = (template: Partial<EmailTemplate>) => {
    const payload: any = {};
    if (template.audience) payload.audience = template.audience.toLowerCase();
    if (template.eventType) payload.event_type = template.eventType;
    if (template.subject) payload.subject = template.subject;
    if (template.body) payload.body = template.body;
    payload.available_variables = ["participant_name", "contest_name", "end_date", "entry_title", "entry_id"];
    payload.is_active = true;
    return payload;
  };

  const fetchTemplates = useCallback(async () => {
    if (!contestId) return;
    try {
      setIsLoading(true);
      const res = await contestControllers.getEmailTemplates(contestId);
      if (res.data?.docs) {
        setTemplatesState(res.data.docs.map(mapApiToTemplate));
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setIsLoading(false);
    }
  }, [contestId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const addTemplate = async (template: Omit<EmailTemplate, "id">) => {
    try {
      const payload = mapTemplateToApi(template);
      await contestControllers.addEmailTemplate(contestId, payload);
      await fetchTemplates();
    } catch (error) {
      console.error("Failed to add template:", error);
      throw error;
    }
  };

  const updateTemplate = async (id: string, updatedFields: Partial<EmailTemplate>) => {
    try {
      const payload = mapTemplateToApi(updatedFields);
      await contestControllers.updateEmailTemplate(contestId, id, payload);
      await fetchTemplates();
    } catch (error) {
      console.error("Failed to update template:", error);
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await contestControllers.deleteEmailTemplate(contestId, id);
      await fetchTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      throw error;
    }
  };

  const getTemplate = (id: string) => templates.find(t => t.id === id);

  return { templates, addTemplate, updateTemplate, deleteTemplate, getTemplate, isLoading };
};
