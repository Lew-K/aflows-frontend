export function initAuthGuard() {
  window.addEventListener("storage", (event) => {
    if (event.key === "access_token" && !event.newValue) {
      window.location.replace("/login");
    }

    if (event.key === "refresh_token" && !event.newValue) {
      window.location.replace("/login");
    }
  });
}
