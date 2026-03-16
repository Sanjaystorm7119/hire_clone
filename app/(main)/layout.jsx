import React from "react";
import DashboardProvider from "../(main)/provider";

function DashboardLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        .eva-ui, .eva-ui * { font-family: 'DM Sans', system-ui, sans-serif; }
        .eva-ui h1, .eva-ui h2, .eva-ui h3, .eva-ui h4, .eva-ui .eva-heading {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
      ` }} />
      <div className="eva-ui bg-[#FAFAF7] min-h-screen">
        <DashboardProvider>
          <div>{children}</div>
        </DashboardProvider>
      </div>
    </>
  );
}

export default DashboardLayout;
