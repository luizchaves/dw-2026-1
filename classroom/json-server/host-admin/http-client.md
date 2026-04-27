# HTTP Client

## Tools

- CLI: [cURL](https://curl.se/), [HTTPie](https://httpie.io/)
- GUI: [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/), [Bruno](https://www.usebruno.com/)
- IDE: [VSCode REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- Programação: [Axios](https://axios-http.com/), [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## cURL (CLI)

### Criando um Host com cURL (POST)

```bash
curl -X POST http://localhost:3000/hosts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IFPB",
    "group": "Desenvolvimento",
    "status": "Manutenção",
    "ip": "192.168.0.122",
    "os": "Windows Server 2019",
    "uptime": "7 dias"
  }'
```

### Listando Hosts com cURL (GET)

```bash
curl http://localhost:3000/hosts
```

### Acessando um Host específico com cURL (GET)

```bash
curl http://localhost:3000/hosts/J8gxy3Dx5VU
```

### Atualizando um Host com cURL (PUT)

```bash
curl -X PUT http://localhost:3000/hosts/J8gxy3Dx5VU \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IFPB Dev",
    "group": "Desenvolvimento",
    "status": "Manutenção",
    "ip": "192.168.0.123",
    "os": "Windows Server 2019",
    "uptime": "7 dias"
  }'
```

### Deletando um Host com cURL (DELETE)

```bash
curl -X DELETE http://localhost:3000/hosts/J8gxy3Dx5VU
```

## httpie (CLI)


### Criando um Host com HTTPie (POST)

```bash
http POST http://localhost:3000/hosts \
  name=IFPB \
  group=Desenvolvimento \
  status=Manutenção \
  ip=192.168.0.122 \
  os="Windows Server 2019" \
  uptime="7 dias"
```

### Listando Hosts com HTTPie (GET)

```bash
http GET http://localhost:3000/hosts
```

### Acessando um Host específico com HTTPie (GET)

```bash
http GET http://localhost:3000/hosts/J8gxy3Dx5VU
```


### Atualizando um Host com HTTPie (PUT)

```bash
http PUT http://localhost:3000/hosts/J8gxy3Dx5VU \
  name="IFPB Dev" \
  group=Desenvolvimento \
  status=Manutenção \
  ip=192.168.0.123 \
  os="Windows Server 2019" \
  uptime="7 dias"
```

### Deletando um Host com HTTPie (DELETE)

```bash
http DELETE http://localhost:3000/hosts/J8gxy3Dx5VU
```

## Rest Client (VSCode Extension)

### Criando um Host com REST Client (POST)

```http
POST http://localhost:3000/hosts
Content-Type: application/json

{
  "name": "IFPB",
  "group": "Desenvolvimento",
  "status": "Manutenção",
  "ip": "192.168.0.122",
  "os": "Windows Server 2019",
  "uptime": "7 dias"
}
```

### Listando Hosts com REST Client (GET)

```http
GET http://localhost:3000/hosts
```

### Acessando um Host específico com REST Client (GET)

```http
GET http://localhost:3000/hosts/J8gxy3Dx5VU
```

### Atualizando um Host com REST Client (PUT)

```http
PUT http://localhost:3000/hosts/J8gxy3Dx5VU
Content-Type: application/json

{
  "name": "IFPB Dev",
  "group": "Desenvolvimento",
  "status": "Manutenção",
  "ip": "192.168.0.123",
  "os": "Windows Server 2019",
  "uptime": "7 dias"
}
```

### Deletando um Host com REST Client (DELETE)

```http
DELETE http://localhost:3000/hosts/J8gxy3Dx5VU
```


