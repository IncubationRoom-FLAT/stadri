export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="game-footer">
      <p className="copyright">
        © {currentYear} Shimane University. All Rights Reserved.
      </p>
    </footer>
  );
}
