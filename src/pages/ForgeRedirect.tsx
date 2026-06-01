import { useEffect } from "react";

const ForgeRedirect = () => {
  useEffect(() => {
    window.location.replace("/forge/index.html");
  }, []);

  return null;
};

export default ForgeRedirect;
