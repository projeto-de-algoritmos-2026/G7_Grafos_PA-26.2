# 🛵 Delivery Routing com Grafos (G7_Grafos_PA-26.2)

Este projeto foi desenvolvido para a disciplina de **Projeto de Algoritmos (PA) - 2026.2**, com foco na aplicação prática de teoria de grafos no mundo real.

A aplicação simula um sistema de rotas de entrega (delivery) conectando pontos geográficos reais através do **OpenStreetMap**, extraindo a malha viária e calculando a rota mais curta e viável utilizando os algoritmos de **Dijkstra** e **Bellman-Ford**.

## 🚀 Tecnologias Utilizadas

O projeto está dividido em duas partes principais:

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) com React 18
- **Linguagem:** TypeScript
- **Estilização:** TailwindCSS
- **Mapas:** Leaflet + React-Leaflet
- **Geocoding:** ViaCEP + Nominatim (Busca avançada com fallback estruturado)

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **Linguagem:** Python 3.11+
- **ORM:** Prisma Client Python
- **Banco de Dados:** SQLite (via Prisma)

---

## ⚙️ Funcionalidades e Algoritmos

* **Geocodificação Inteligente:** O sistema aceita a entrada de CEPs e utiliza múltiplas APIs (ViaCEP + Nominatim) para traçar as exatas coordenadas de ruas e bairros brasileiros de forma dinâmica e resiliente.
* **Mapeamento em Tempo Real:** Conexão direta com a API do **Overpass / OSM** para extrair a malha viária (ruas, rodovias, avenidas) baseada na distância entre a Origem e o Destino.
* **Algoritmo de Dijkstra:** Implementação clássica com fila de prioridades para encontrar o caminho mais rápido com pesos não-negativos.
* **Algoritmo de Bellman-Ford:** Implementação em Python (backend) e TypeScript (frontend) com suporte a verificação de ciclos negativos e otimização de *early stopping*.
* **Visualização Animada:** Ao calcular a rota, a interface projeta e anima o processo de "exploração" do algoritmo pelos caminhos do grafo até a descoberta da rota ideal.

---

## 💻 Como Configurar e Executar

Siga as instruções abaixo para rodar o projeto localmente na sua máquina.

### 1. Clonando o repositório

```bash
git clone https://github.com/projeto-de-algoritmos-2026/G7_Grafos_PA-26.2.git
cd G7_Grafos_PA-26.2
```

### 2. Configurando o Backend (Python / FastAPI)

Abra um terminal e navegue até a pasta `backend`:

```bash
cd backend
```

1. **Crie um ambiente virtual e ative-o:**
   - No Windows:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - No Linux/Mac:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

2. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure o Banco de Dados (Prisma):**
   Gere os schemas e sincronize com o SQLite:
   ```bash
   prisma generate
   prisma db push
   ```

4. **Inicie o servidor local:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   > A API estará rodando em `http://localhost:8000`. Você pode acessar a documentação interativa em `http://localhost:8000/docs`.

### 3. Configurando o Frontend (Node / Next.js)

Abra **outro** terminal e navegue até a pasta `frontend`:

```bash
cd frontend
```

1. **Instale as dependências:**
   ```bash
   npm install
   ```
   *(ou `yarn install` / `pnpm install`)*

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acesse a aplicação:**
   Abra o seu navegador e acesse [http://localhost:3000](http://localhost:3000).

---

## 🗺️ Como usar a aplicação

1. Navegue até a tela de rotas de um pedido.
2. Na barra lateral, digite o **CEP de Origem** (ex: `71940-540` para Águas Claras, ou `71065-023` para Guará II). O destino já estará preenchido dependendo da tela.
3. O sistema tentará localizar os pontos no mapa com alta precisão através do Nominatim/ViaCEP.
4. Escolha o algoritmo desejado (Dijkstra ou Bellman-Ford).
5. Clique em encontrar rota. O sistema baixará a malha viária do local e desenhará na tela o avanço passo-a-passo da exploração do algoritmo até a origem ser conectada ao destino.

## 🤝 Autores e Contribuidores

- Grupo 7 (G7) - Projeto de Algoritmos (PA) / 2026.2