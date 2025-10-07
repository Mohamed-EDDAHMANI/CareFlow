# Admin

L’admin howa l’utilisateur li ʿando control total 3la system.
Huwwa kayt7km f l-users, permissions, w paramètres généraux.

🔹 Dourou (responsabilités)

➤ Ydir users jdod : kay3ti role (practitioner, receptionist, patient, etc.).

==user==
    ==> id
    ==> name
    ==> email
    ==> password
    ==> birthDate
    ==> status
    ==> roleType
    ==> roleId
    ==> createdAt / updatedAt
    ==> refreshToken

➤ Y9der ysuspend / yactivate compte (ex: user ma b9ach khadim → ytsada).

➤ Y9der ymodifier roles, emails, w access permissions.

==role==
    ==> id
    ==> name :EX "admin" | "practitioner" | "receptionist" |
    ==> description
    ==> permissions : {"create_user" "delete_user" "update_patient_record" "view_patient_record" "create_appointment" "cancel_appointment" ...}

➤ Yt9ed paramètre système (ex: plages horaires globales (ghathtajo f logic dyal RDV creating), types de notifications Email/whatsapp).
==notifications==
    ==> _id
    ==> userId
    ==> title
    ==> type
    ==> message
    ==> relatedAppointmentId

------------------------------------------------------------
# Practitioner

Practitioner howa li kayʿni l-professionnel de santé (médecin, infirmier, kiné, etc.).

🔹 Dourou

➤ Kaydir consultations (RDV). CRUD selon horaires globales et l'abilité

==appointments (RDV)==
    ==> _id
    ==> patientId (qui est le patient)
    ==> createdBy → ref users._id (receptionist / practitioner)
    ==> type ENAM (consultation générale , suivi)
    ==> start (date/heure début)
    ==> end (date/heure fin)
    ==> reason / motif de consultation (ex: checkup, vaccin, suivi...)
    ==> document nullable
    ==> PraticienId (qui est le doc ou infir)
    ==> status ("scheduled" ,"completed", "cancelled")
    ==> createdAt / updatedAt

➤ 3ando agenda dyalou f system (rdv, horaires).
    - l'affichage des (RDV) dant un emploi du temps

➤ Ykhdem 3la dossiers patients : l'historique des RDV et résultats médicaux

==medicalRecords (résultats médicaux)==
    ==> Priorité (Normal, à suivi, Traitement nécessaire, Urgent ) current setuation
    ==> typeMedical (scanner, tretment)
    ==> description nullable
    ==> document nullable
    ==> Date du résultat
    ==> appointmentId

➤ Y9der ymodifier statuts dyal RDV (ex: men “scheduled” → “completed” baʿd l-visite).

------------------------------------------------------------
# Receptionist

Receptionist howa li kaykoun f l’accueil dyal clinique / cabinet, li kaytsel b patients.

🔹 Dourou

➤ Ykhli9 patient jdida (dossier patient, contact, assurance...).
➤ Ykhli9 / ymodifier / yannuler RDV (b nom dyal patient).
➤ Y9der ychouf disponibilité dyal practitioners (bash y9ayed patient f wa9t faragh).

------------------------------------------------------------
# Patient

Patient howa l-mariḍ li kayji l-clinic, w kaykon 3ndo compte f system bach ydir suivi dyal dossier dyalou.

🔹 Dourou

➤ Y9der ychouf l-infos dyalou (nom, contact, assurance, allergies, etc.).
➤ Ychouf appointments dyalou (date, practitioner, status).
➤ Yrecevoir notifications par email (confirmation, rappel RDV).
➤ F versions plus avancées: y9der ymodifier préférences / consentements (privacy settings).
