export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600">
        <p className="font-semibold text-uniguacu-blue">Faculdade Uniguaçu</p>
        <p className="text-sm">Contato: (45) 98830-1557 | email@uniguacu.br</p>
        <p className="text-xs mt-4">
          &copy; {currentYear} Portfólio Uniguaçu. Todos os direitos reservados by: Rogério Santos de Jesus.
        </p>
      </div>
    </footer>
  );
}