
export const EP = {
  me: process.env.REACT_APP_EP_ME || "/users/profile",
  profile: process.env.REACT_APP_EP_PROFILE || "/users/profile",
  profileUpdate:
    process.env.REACT_APP_EP_PROFILE_UPDATE || "/users/profile",
  usersList: process.env.REACT_APP_EP_USERS_LIST || "/users",
  avatarUpload:
    process.env.REACT_APP_EP_AVATAR_UPLOAD || "/users/upload-avatar",
  avatarDelete:
    process.env.REACT_APP_EP_AVATAR_DELETE || "/users/avatar",
};

export default EP;
