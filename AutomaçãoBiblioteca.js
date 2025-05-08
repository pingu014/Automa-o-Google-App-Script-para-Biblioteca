function onEdit(e) {
  const aba = '4° ANO "A"';

  const sheet = e.source.getSheetByName(aba);
  const range = e.range;

  if (sheet.getName() !== aba) return;

  const linha = range.getRow();
  const coluna = range.getColumn();

  // Ignora cabeçalho
  if (linha === 1) return;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataEmprestimo = sheet.getRange(linha, 5).getValue(); // E
  const dataPrevista = sheet.getRange(linha, 6).getValue();   // F
  const dataDevolucao = sheet.getRange(linha, 7).getValue();  // G
  const totalEmprestimos = sheet.getRange(linha, 1).getValue(); // A

  // === 1. Quando adiciona data em DATA DE EMPRÉSTIMO (E)
  if (coluna === 5 && dataEmprestimo instanceof Date) {
    const novaData = new Date(dataEmprestimo);
    novaData.setDate(novaData.getDate() + 7);
    sheet.getRange(linha, 6).setValue(novaData); // F

    sheet.getRange(linha, 9).setValue("EMPRESTADO"); // I

    sheet.getRange(linha, 7).clearContent(); // G
    sheet.getRange(linha, 8).clearContent(); // H
  }

  // === 2. Quando adiciona data em DATA DE DEVOLUÇÃO (G)
  if (coluna === 7 && dataDevolucao instanceof Date) {
    Utilities.sleep(100);

    sheet.getRange(linha, 9).setValue("DEVOLVIDO"); // I

    const novoTotal = (parseFloat(totalEmprestimos) || 0) + 0.5;
    sheet.getRange(linha, 1).setValue(novoTotal); // A

    sheet.getRange(linha, 5).clearContent(); // E
    sheet.getRange(linha, 6).clearContent(); // F
    sheet.getRange(linha, 8).clearContent(); // H
  }

  // === 3. Quando DATA DE DEVOLUÇÃO (G) é apagada
  if (coluna === 7 && !dataDevolucao) {
    sheet.getRange(linha, 9).clearContent(); // I

    const emprestimoValido = sheet.getRange(linha, 5).getValue();
    if (emprestimoValido instanceof Date) {
      sheet.getRange(linha, 9).setValue("EMPRESTADO");
    }
  }

  // === 4. Quando DATA DE EMPRÉSTIMO (E) é apagada
  if (coluna === 5 && !dataEmprestimo) {
    sheet.getRange(linha, 6).clearContent(); // F
    sheet.getRange(linha, 8).clearContent(); // H
    sheet.getRange(linha, 9).clearContent(); // I
  }

  // === 5. Verifica ATRASO e envia e-mail
  if (
    (coluna === 5 || coluna === 6 || coluna === 7 || coluna === 9) &&
    dataPrevista instanceof Date &&
    !dataDevolucao
  ) {
    const dataLimpa = new Date(dataPrevista);
    dataLimpa.setHours(0, 0, 0, 0);

    const situacaoCell = sheet.getRange(linha, 10); // J

    if (hoje > dataLimpa) {
      sheet.getRange(linha, 9).setValue("ATRASADO"); // I

      const diffMs = hoje - dataLimpa;
      const diasAtraso = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      sheet.getRange(linha, 8).setValue(diasAtraso); // H

      // === Atualiza situação com base nos dias de atraso
      if (diasAtraso >= 30) {
        situacaoCell.setValue("restrito");
      } else if (diasAtraso >= 14) {
        situacaoCell.setValue("Observação");
      } else {
        situacaoCell.setValue("Autorizado");
      }

      // === Envio de e-mail automático
      const titulo = sheet.getRange(linha, 2).getValue(); // B
      const aluno = sheet.getRange(linha, 3).getValue();  // C
      const turma = sheet.getRange(linha, 4).getValue();  // D
      const dataEmp = sheet.getRange(linha, 5).getDisplayValue(); // E
      const emailDestino = "giroteca24@gmail.com";

      const assunto = `📚 Livro Atrasado - ${aluno}`;
      const corpo = `
        <p><strong>ATENÇÃO:</strong> Livro atrasado detectado.</p>
        <ul>
          <li><strong>Título do Livro:</strong> ${titulo}</li>
          <li><strong>Nome do Aluno:</strong> ${aluno}</li>
          <li><strong>Turma:</strong> ${turma}</li>
          <li><strong>Data do Empréstimo:</strong> ${dataEmp}</li>
          <li><strong>Dias de Atraso:</strong> ${diasAtraso}</li>
        </ul>
      `;

      MailApp.sendEmail({
        to: emailDestino,
        subject: assunto,
        htmlBody: corpo
      });
    } else {
      // Limpa campo de atraso se não atrasado
      sheet.getRange(linha, 8).clearContent();

      // Reavalia situação com base na coluna H (dias de atraso)
      const diasAtraso = sheet.getRange(linha, 8).getValue(); // H
      if (diasAtraso === "" || diasAtraso < 14) {
        situacaoCell.setValue("Autorizado");
      } else if (diasAtraso >= 14 && diasAtraso < 29) {
        situacaoCell.setValue("Observação");
      } else if (diasAtraso >= 30 && diasAtraso < 365) {
        situacaoCell.setValue("Restrição");
      }
    }
  }
}

