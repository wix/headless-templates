import { members } from "@wix/members";
import { Member } from ".";

export const getCurrentMember = async (): Promise<Member | null> => {
  try {
    const member = await members.getCurrentMember({ fieldsets: ["FULL"] });
    if (!member) {
      console.log('==== No member found');
    }
    return member.member;
  } catch (error) {
    console.log(error);
    return null;
  }
};
