import { submissions } from "@wix/forms";
import { WIX_FORM_ID } from "./constants";

type SubmissionResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export async function submitFormRegistration(
  formData: Record<string, string>
): Promise<SubmissionResult> {
  try {
    const submission = {
      formId: WIX_FORM_ID,
      submissions: formData,
    };

    const { status } = await submissions.createSubmission(submission);

    return {
      success: status === "PENDING" || status === "CONFIRMED",
    };
  } catch (error) {
    console.error("Form submission error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
