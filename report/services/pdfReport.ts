import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";
import { SpendingModel } from "../../expenses/models/SpendingModel";
import { MonthlyReportModel } from "../models/MonthlyReportModel";

interface PDFData {
  month: string;
  year: number;
  budget: number;
  spendings: SpendingModel[];
}

export async function generateMonthlyReport({
  month,
  year,
  budget,
  spendings,
}: PDFData) {
  const totalSpent = spendings.reduce((acc, curr) => acc + curr.value, 0);
  const balance = budget - totalSpent;
  const balanceClass = balance >= 0 ? "balance-positive" : "balance-negative";

  // Carga de logo (asegúrate de tener una imagen en tus assets)
  const logoAsset = Asset.fromModule(require("../../assets/AppIconCircle.png"));
  await logoAsset.downloadAsync();
  const logoBase64 = await fetch(logoAsset.uri)
    .then((res) => res.blob())
    .then((blob) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    });

  const githubAsset = Asset.fromModule(require("../../assets/github-mark.png"));
  await githubAsset.downloadAsync();
  const githubBase64 = await fetch(githubAsset.uri)
    .then((res) => res.blob())
    .then((blob) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    });

  const sortedSpendings = [...spendings].sort((a, b) => b.value - a.value);
  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: sans-serif;
            padding: 24px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #f9be03;
          }
          .header-img {
            width: 120px;
            margin: 0 auto 16px;
            display: block;
          }
          table {
            width: 60%;
            border-collapse: collapse;
            margin: 16px auto;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
          }
          .summary {
            margin-top: 24px;
          }
          .summary p {
            font-size: 16px;
          }
          footer {
            position: fixed;
            bottom: 24px;
            left: 24px;
            right: 24px;
            font-size: 12px;
            color: #666;
            text-align: center;
            border-top: 1px solid #ccc;
            padding-top: 8px;
          }
          footer a {
            color: #4a90e2;
          }
          footer strong {
            color: #f9be03;
          }
          .footer-logo {
            height: 16px;
            vertical-align: middle;
            margin: 0 4px;
          }
          .balance-positive {
            color: green;
            font-weight: bold;
          }
          .balance-negative {
            color: red;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <img src="${logoBase64}" class="header-img" alt="Logo"/>
        <h1>Resumen mensual - ${month} ${year}</h1>

        <div class="summary">
          <p><strong>Presupuesto:</strong> $${budget.toFixed(2)}</p>
          <p><strong>Total gastado:</strong> $${totalSpent.toFixed(2)}</p>
          <p><strong>Balance disponible:</strong> <span class="${balanceClass}">$${balance.toFixed(
    2
  )}</span></p>
        </div>

        <h2>Gastos por categoría</h2>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            ${sortedSpendings
              .map(
                (s) =>
                  `<tr><td>${s.category}</td><td>$${s.value.toFixed(
                    2
                  )}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
        <footer>
          <p>
            Gracias por usar 
            <img src="${logoBase64}" class="footer-logo" alt="logo" />
            <strong>Cuadrando las Lucas</strong>
            <img src="${logoBase64}" class="footer-logo" alt="logo" />
            <br/>
            Desarrollado con cariño por 
            <a href="https://github.com/CarlMacGar" target="_blank">
              <img src="${githubBase64}" class="footer-logo" alt="GitHub-" />
              CarlMacGar
            </a>
          </p>
        </footer>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      console.log("PDF generado en:", uri);
    }
  } catch (error) {
    console.error("Error generando el PDF:", error);
  }
}

export async function generateAnnualReport(
  year: number,
  annualReport: MonthlyReportModel[]
) {
  // Carga de logo (asegúrate de tener una imagen en tus assets)
  const logoAsset = Asset.fromModule(require("../../assets/AppIconCircle.png"));
  await logoAsset.downloadAsync();
  const logoBase64 = await fetch(logoAsset.uri)
    .then((res) => res.blob())
    .then((blob) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    });

  const githubAsset = Asset.fromModule(require("../../assets/github-mark.png"));
  await githubAsset.downloadAsync();
  const githubBase64 = await fetch(githubAsset.uri)
    .then((res) => res.blob())
    .then((blob) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    });

  const getBalance = (budget: string, expenses: number) => {
    const budgetNumber = parseFloat(budget);
    return (budgetNumber - expenses).toFixed(2);
  };

  const html = `
  <html>
    <head>
      <style>
        body {
          font-family: sans-serif;
          padding: 24px;
          color: #333;
        }
        h1 {
          text-align: center;
          color: #f9be03;
        }
        .header-img {
          width: 120px;
          margin: 0 auto 16px;
          display: block;
        }
        table {
          width: 80%;
          border-collapse: collapse;
          margin: 16px auto;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
        }
        .positive {
          color: green;
          font-weight: bold;
        }
        .negative {
          color: red;
          font-weight: bold;
        }
        .summary {
          margin-top: 24px;
        }
        .summary p {
          font-size: 16px;
        }
        footer {
          position: fixed;
          bottom: 24px;
          left: 24px;
          right: 24px;
          font-size: 12px;
          color: #666;
          text-align: center;
          border-top: 1px solid #ccc;
          padding-top: 8px;
        }
        footer a {
          color: #4a90e2;
          text-decoration: none;
        }
        footer strong {
          color: #f9be03;
        }
        .footer-logo {
          height: 16px;
          vertical-align: middle;
          margin: 0 4px;
        }
      </style>
    </head>
    <body>
      <img src="${logoBase64}" class="header-img" alt="Logo"/>
      <h1>Tu cuadre de lucas ${year - 1}</h1>
      <p>El ${
        year - 1
      } ha terminado y tu cuadre de lucas por meses se ve así, te presento el presupuesto, el total de gastos y el balance de cada mes. Muchas gracias por haber utilizado Cuadrando las lucas, espero te haya servido y la sigas usando este nuevo año ${year}. Cuídate mucho.</p>
      <h2>Resumen mensual</h2>
      <table>
        <thead>
          <tr>
            <th>Mes</th>
            <th>Presupuesto</th>
            <th>Total de gastos</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${annualReport
            .map((ar) => {
              const balance = getBalance(ar.monthBudget, ar.monthSpendings);
              const balanceValue = parseFloat(balance);
              const isPositive = balanceValue >= 0;
              const arrow = isPositive ? "↑" : "↓";
              const balanceClass = isPositive ? "positive" : "negative";
              return `
                <tr>
                  <td>${ar.month}</td>
                  <td>$${parseFloat(ar.monthBudget).toFixed(2)}</td>
                  <td>$${ar.monthSpendings.toFixed(2)}</td>
                  <td class="${balanceClass}">${arrow} $${balanceValue.toFixed(
                2
              )}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
      <footer>
        <p>
          Gracias por usar 
          <img src="${logoBase64}" class="footer-logo" alt="logo" />
          <strong>Cuadrando las Lucas</strong>
          <img src="${logoBase64}" class="footer-logo" alt="logo" />
          <br/>
          Desarrollado con cariño por 
          <a href="https://github.com/CarlMacGar" target="_blank">
            <img src="${githubBase64}" class="footer-logo" alt="GitHub-" />
            CarlMacGar
          </a>
        </p>
      </footer>
    </body>
  </html>
`;

  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      console.log("PDF generado en:", uri);
    }
  } catch (error) {
    console.error("Error generando el PDF:", error);
  }
}
