import { submissions } from "@wix/forms";

export interface FormData {
  teamName: string;
  ageGroup: string;
  skillLevel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequirements?: string;
}

type SubmissionResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export enum FormFieldsIds {
  teamName = "team_name",
  ageGroup = "age_group_1",
  skillLevel = "skill_level",
  firstName = "first_name_1536",
  lastName = "last_name_7eec",
  email = "email_8874",
  phone = "phone_f28a",
  specialRequirements = "special_requirements_or_requests",
}

export async function submitTournamentRegistration(
  formData: FormData
): Promise<SubmissionResult> {
  try {
    const requiredFields = ["teamName", "email"] as const;
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return {
        success: false,
        error: "Invalid email format",
      };
    }

    const submission = {
      formId: "2fc1513a-7ad0-4a5e-a731-1d0fb6e0e7e1",
      submissions: {
        [FormFieldsIds.teamName]: formData.teamName,
        [FormFieldsIds.ageGroup]: formData.ageGroup,
        [FormFieldsIds.skillLevel]: formData.skillLevel,
        [FormFieldsIds.firstName]: formData.firstName,
        [FormFieldsIds.lastName]: formData.lastName,
        [FormFieldsIds.email]: formData.email,
        [FormFieldsIds.phone]: formData.phone,
        [FormFieldsIds.specialRequirements]: formData.specialRequirements,
      },
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
