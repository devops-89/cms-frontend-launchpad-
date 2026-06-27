export const getBaseEmailTemplate = (
  content: string,
  title: string,
  contestName: string = "{{contest_name}}"
) => {
  // Check if content already contains HTML tags (e.g. from a Rich Text Editor)
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);
  
  let formattedContent = content;
  if (!hasHtml) {
    formattedContent = content
      .split("\n")
      .map((line) => (line.trim() ? `<p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 12px;">${line}</p>` : ""))
      .join("");
  }

  return `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">${contestName}</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); color: #4b5563; line-height: 1.6; font-size: 16px; word-wrap: break-word; overflow-wrap: break-word;">
    <h2 style="color: #111827; font-size: 20px; margin-top: 0; margin-bottom: 20px;">${title}</h2>
    
    <div id="cms-email-inner-body" style="word-wrap: break-word; overflow-wrap: break-word;">
      ${formattedContent}
    </div>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    &copy; 2026 Top Young Innovators. All rights reserved.
  </div>
</div>
  `.trim();
};
