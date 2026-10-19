# API de Motos

API em Node.js + Express + SQLite para cadastrar e buscar motos.

## Como rodar

```bash
npm install
node servidor.js
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
