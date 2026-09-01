# STOCK.IO - Backend em Python com FastAPI & Supabase

API REST assíncrona desenvolvida em **Python (FastAPI)** integrada ao banco de dados e autenticação do **Supabase**.

---

## 🚀 Como Executar o Backend

### 1. Instalar Dependências
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar o Supabase (.env)
Copie o arquivo `.env.example` para `.env` e adicione suas credenciais obtidas no painel do Supabase (*Project Settings -> API*):
```env
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_KEY=<sua-anon-key-ou-service-role-key>
```

### 3. Iniciar o Servidor
```bash
uvicorn app.main:app --reload --port 8000
```

---

## 📚 Documentação da API

- **Swagger UI Interativo**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📌 Endpoints Principais

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Registro de novos usuários com nome completo, email e senha |
| `POST` | `/api/auth/login` | Autenticação de usuário com email e senha |
| `GET` | `/api/auth/health` | Verificação do status do servidor e Supabase |
