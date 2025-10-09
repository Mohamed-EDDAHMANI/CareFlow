# Commandes Docker pour exécuter votre projet Node.js

Voici les commandes Docker essentielles pour gérer votre projet, incluant les quatre commandes de base plus trois autres commandes utiles.

---

## 1. Construire l'image et démarrer le conteneur

```bash
docker-compose -f docker/docker-compose.yml up --build
```

* Construit l'image Docker à partir de votre Dockerfile.
* Démarre le conteneur.
* Utile la première fois ou après des modifications dans le Dockerfile ou les dépendances.

---

## 2. Démarrer le conteneur sans reconstruire

```bash
docker-compose -f docker/docker-compose.yml up
```

* Démarre le conteneur en utilisant l'image existante.
* Plus rapide que la reconstruction.

---

## 3. Arrêter les conteneurs

```bash
docker-compose -f docker/docker-compose.yml down
```

* Arrête et supprime les conteneurs.
* Les images restent intactes.

---

## 4. Vérifier les logs du conteneur

```bash
docker-compose -f docker/docker-compose.yml logs -f
```

* Suivre les logs en temps réel.
* Utile pour le débogage.

---

## 5. Lister les conteneurs en cours d'exécution

```bash
docker ps
```

* Affiche tous les conteneurs Docker en cours.
* Utile pour vérifier si votre conteneur Node.js est actif.

---

## 6. Entrer dans un conteneur en cours d'exécution

```bash
docker exec -it <nom_ou_id_du_conteneur> bash
```

* Ouvre un shell à l'intérieur du conteneur.
* Utile pour inspecter les fichiers ou exécuter des commandes manuellement.

---

## 7. Supprimer tous les conteneurs arrêtés

```bash
docker container prune
```

* Nettoie les conteneurs arrêtés pour libérer de l'espace.
* Docker demandera une confirmation avant la suppression.

---

**Conseils :**

* Remplacez `<nom_ou_id_du_conteneur>` par le nom réel du conteneur obtenu via `docker ps`.
* Utilisez `docker-compose -f docker/docker-compose.yml up -d` pour exécuter les conteneurs en **mode détaché** (en arrière-plan).
