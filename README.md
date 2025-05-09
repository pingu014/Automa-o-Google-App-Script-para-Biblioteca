# **📚 Controle de Empréstimos de Livros – Biblioteca de 4º e 5° Anos para E.E.F Francisco Rufino (Novo Oriente - CE)**

*Este repositório contém um script em Google Apps Script automatizado para gerenciar empréstimos de livros de uma turma escolar. Ele foi desenvolvido para funcionar em conjunto com uma planilha do Google Sheets, monitorando prazos de devolução, calculando atrasos e enviando e-mails automaticamente em casos de atraso. Tudo de forma simples e eficaz!*

## ⚙️ Como funciona?
O script é ativado automaticamente sempre que qualquer célula for editada (onEdit). A partir disso, ele toma decisões com base em qual coluna foi alterada.

### 🧠 Lógica do Script, Explicada Passo a Passo
#### ✅ 1. Registro do Empréstimo (Coluna E)
##### Quando uma data de empréstimo é registrada:

- Define automaticamente a data de devolução prevista (7 dias depois).
- Marca o status como "EMPRESTADO" 📘.
- Limpa campos de devolução e atraso para evitar conflito.

#### 📦 2. Registro da Devolução (Coluna G)
##### Quando uma data de devolução é registrada:

- Muda o status para "DEVOLVIDO" ✅.
- Soma 0.5 ponto ao total de empréstimos do aluno.
- Limpa os dados de empréstimo e atraso.

#### 🧹 3. Devolução Apagada
##### Se a data de devolução for apagada:

- Remove o status de devolução.
- Se ainda houver uma data de empréstimo válida, retorna o status "EMPRESTADO".

#### 🧼 4. Empréstimo Apagado
##### Se a data de empréstimo for apagada:

- Limpa a data prevista, os dias de atraso e o status.

#### 🚨 5. Verificação de Atraso
##### Quando há uma data prevista de devolução e nenhuma devolução registrada:

- Compara com a data atual.
- Se estiver atrasado, define status como "ATRASADO" ⏰ e calcula os dias de atraso.

##### Classifica a situação:

> [!TIP]
> Autorizado (até 13 dias de atraso)

> [!WARNING]
> Observação (14 a 29 dias)

> [!CAUTION]
> Restrição (30 dias ou mais)

#### ✉️ 6. Envio de E-mail Automático
##### Se o livro estiver atrasado, envia um e-mail com:
- Título do livro
- Nome do aluno
- Turma
- Data do empréstimo
- Dias de atraso

## 📝 Estrutura da Tabela:
##### Coluna Conteúdo
- **A:** Total de Empréstimos
- **B:** Título do Livro
- **C:** Nome do Aluno
- **D:** Turma
- **E:** Data de Empréstimo
- **F:** Data Prevista
- **G:** Data de Devolução
- **H:** Dias de Atraso
- **I:** Status
- **J:** Situação

## 🛠️ Requisitos

Conta Google com acesso ao Google Sheets.
Permissões para usar Google Apps Script.
Endereço de e-mail configurado para receber notificações (atualmente: giroteca24@gmail.com).

## 🔐 Observações

O sistema considera que a planilha tem cabeçalho na primeira linha.
O cálculo de atraso desconsidera horas e minutos, focando apenas em dias completos.
Os valores são manipulados automaticamente para manter consistência nos registros.

## 🚀 Objetivo

Este projeto foi criado para facilitar o controle da Giroteca (biblioteca da turma), incentivando o cuidado com os prazos e promovendo responsabilidade entre os alunos. 👩‍🏫👨‍🏫

# Exemplo de Planilha:

[📊 Planilha](https://imgur.com/YmRUKfr)

# Atualização v1.0.1 > [Link da nova versão](https://github.com/pingu014/Automa-o-Google-App-Script-para-Biblioteca/releases/tag/v0.0.1)

## ✅ Adicionado um trigger de tempo (time-driven trigger)
Criada uma função separada para verificar e atualizar os atrasos diariamente, configure um gatilho de tempo para executá-la automaticamente todos os dias.

## ⏱️ Etapa 1: Criar a função verificaAtrasosDiarios
#### Adicione essa nova função ao seu script:

     function verificaAtrasosDiarios() {
        const aba = '4° ANO "A"';
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(aba);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const ultimaLinha = sheet.getLastRow();

        for (let linha = 2; linha <= ultimaLinha; linha++) {
          const dataPrevista = sheet.getRange(linha, 6).getValue(); // F
          const dataDevolucao = sheet.getRange(linha, 7).getValue(); // G

          if (dataPrevista instanceof Date && !dataDevolucao) {
            const dataLimpa = new Date(dataPrevista);
            dataLimpa.setHours(0, 0, 0, 0);

            const situacaoCell = sheet.getRange(linha, 10); // J

            if (hoje > dataLimpa) {
              sheet.getRange(linha, 9).setValue("ATRASADO"); // I

              const diffMs = hoje - dataLimpa;
              const diasAtraso = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              sheet.getRange(linha, 8).setValue(diasAtraso); // H

              if (diasAtraso >= 30) {
                situacaoCell.setValue("restrito");
              } else if (diasAtraso >= 14) {
                situacaoCell.setValue("Observação");
              } else {
                situacaoCell.setValue("Autorizado");
              }
            } else {
               sheet.getRange(linha, 8).clearContent(); // limpa dias de atraso
               situacaoCell.setValue("Autorizado");
              }
            }
          }
        }

## ✅ Etapa 2: Criar um gatilho de tempo
### No editor de scripts (Apps Script), clique no ícone de relógio no menu lateral esquerdo.

#### Clique em “+ Adicionar gatilho”.

Em:
1. Função a ser executada: selecione verificaAtrasosDiarios
2. Tipo de gatilho: escolha Gatilho baseado em tempo
3. Frequência: escolha Diariamente
4. Horário: selecione o horário desejado (ex: entre 6h e 7h)

*Com isso, sua planilha atualizará os dias de atraso (coluna H) e a situação (coluna J) automaticamente todos os dias, mesmo sem ninguém editar a planilha.*
