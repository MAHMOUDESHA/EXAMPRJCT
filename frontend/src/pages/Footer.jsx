import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      background: 'white',
      padding: '15px 30px',
      boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center',
      color: '#666',
      fontSize: '14px'
    }}>
      <p style={{ margin: 0 }}>
        &copy; {currentYear} School Examination System. All rights reserved.
      </p>
    </footer>
   
  );
};

export default Footer;
