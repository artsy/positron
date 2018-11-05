export const ModalTypes = {
  locked: {
    header: {
      icon: "lock",
      text: "locked",
      color: "grayMedium",
    },
    title: "This article is currently being edited",
    description: (
      time,
      name
    ) => `Only one user is allowed to edit an article at a time. 
      This article was last saved ${time} and is being edited by ${name}`,
    actions: [
      {
        title: "Home",
        action: () => {
          document.location.assign("/")
        },
      },
    ],
    canDismiss: false,
  },
  timeout: {
    header: {
      text: "warning",
      color: "yellowMedium",
    },
    title: "You are about to be redirected",
    description: (
      time,
      name
    ) => `Users are redirected from editing an article after 10 minutes
      of inactivity. Click 'Continue' to keep editing this article`,
    actions: [
      {
        title: "Continue",
        action: () => {
          // close modal and reset count
          this.close()
        },
      },
      {
        title: "Leave",
        action: () => {
          document.location.assign("/")
        },
      },
    ],
    canDismiss: true,
  },
}
