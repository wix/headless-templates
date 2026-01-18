import { members } from "@wix/members";

export type Member = {
  loginEmail?: members.GetMyMemberResponse['member']['loginEmail']; // type is string
  loginEmailVerified?: members.GetMyMemberResponse['member']['loginEmailVerified']; // type is boolean
  status?: members.GetMyMemberResponse['member']['status']; // type is enum of "UNKNOWN" | "PENDING" | "APPROVED" | "BLOCKED" | "OFFLINE"
  contact?: {
    firstName?: members.GetMyMemberResponse['member']['contact']['firstName']; // type is string
    lastName?: members.GetMyMemberResponse['member']['contact']['lastName']; // type is string
    phones?: members.GetMyMemberResponse['member']['contact']['phones']; // type is string[]
  },
  profile?: {
    nickname?: members.GetMyMemberResponse['member']['profile']['nickname']; // type is string
    photo?: {
      url?: members.GetMyMemberResponse['member']['profile']['photo']['url']; // type is string
      height?: members.GetMyMemberResponse['member']['profile']['photo']['height']; // type is number
      width?: members.GetMyMemberResponse['member']['profile']['photo']['width']; // type is number
      offsetX?: members.GetMyMemberResponse['member']['profile']['photo']['offsetX']; // type is number
      offsetY?: members.GetMyMemberResponse['member']['profile']['photo']['offsetY']; // type is number
    },
    title?: members.GetMyMemberResponse['member']['profile']['title']; // type is string
  },
  _createdDate?: members.GetMyMemberResponse['member']['_createdDate']; // type is Date
  _updatedDate?: members.GetMyMemberResponse['member']['_updatedDate']; // type is Date
  lastLoginDate?: members.GetMyMemberResponse['member']['lastLoginDate']; // type is Date
}