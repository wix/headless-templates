import { submissions } from "@wix/forms";

type SubmissionResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export enum FormFieldsWixIds {
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
  formData: Record<string, string>
): Promise<SubmissionResult> {
  try {
    const requiredFields = [
      FormFieldsWixIds.teamName,
      FormFieldsWixIds.email,
    ] as const;
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[FormFieldsWixIds.email])) {
      return {
        success: false,
        error: "Invalid email format",
      };
    }

    const submission = {
      formId: "2fc1513a-7ad0-4a5e-a731-1d0fb6e0e7e1",
      submissions: {
        [FormFieldsWixIds.teamName]: formData.teamName,
        [FormFieldsWixIds.ageGroup]: formData.ageGroup,
        [FormFieldsWixIds.skillLevel]: formData.skillLevel,
        [FormFieldsWixIds.firstName]: formData.firstName,
        [FormFieldsWixIds.lastName]: formData.lastName,
        [FormFieldsWixIds.email]: formData.email,
        [FormFieldsWixIds.phone]: formData.phone,
        [FormFieldsWixIds.specialRequirements]: formData.specialRequirements,
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
