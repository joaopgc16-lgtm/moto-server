# API de Motos

API em Node.js + Express + SQLite para cadastrar e buscar motos.

## Como rodar

```bash
npm install
npm run devAPI //roda o servidor que controla o banco de dados
npm run dev //roda o site de busca
```

O servidor sobe em http://localhost:3000.

## Rotas

| Método | Rota | O que faz |
|---|---|---|
| GET | `/?motosearch=r6` | Busca motos por texto |
| GET | `/motos/:id` | Devolve uma moto |
| POST | `/addmotos` | Cadastra uma moto |
| PUT | `/modifymoto/:id` | Edita uma moto |
| DELETE | `/motosdelete/:id` | Remove uma moto |
