drop table V_PE_PERSONNE if exists;
create table V_PE_PERSONNE (I_PERSONNE integer not null, I_ACS integer, D_NAISSANCE timestamp, D_CREAT timestamp, X_QUICRE varchar(255), X_PRENOM varchar(255), X_PRENOM_LONG varchar(255), X_NOM varchar(255), X_NOM_LONG varchar(255), P_SEXE varchar(255), D_MODIF timestamp, X_QUIMOD varchar(255), primary key (I_PERSONNE));
INSERT INTO V_PE_PERSONNE(I_PERSONNE, X_NOM, X_PRENOM, I_ACS, X_NOM_LONG, X_PRENOM_LONG, D_NAISSANCE, P_SEXE, D_CREAT, X_QUICRE, D_MODIF, X_QUIMOD) VALUES(268229, 'DELOBRE', 'OLIVIER ROMAIN', 6, 'Delobre', 'Olivier Romain', '1981-04-27 00:00:00', 'M', '2016-01-18 11:31:38', 'Dieu', null, null);
INSERT INTO V_PE_PERSONNE(I_PERSONNE, X_NOM, X_PRENOM, I_ACS, X_NOM_LONG, X_PRENOM_LONG, D_NAISSANCE, P_SEXE, D_CREAT, X_QUICRE, D_MODIF, X_QUIMOD) VALUES(268230, 'DELORME', 'JEAN MOULOUD', 6, 'Delorme', 'Jean Mouloud', '1981-04-29 00:00:00', 'M', '2016-01-19 11:31:38', 'Dieu', null, null);
INSERT INTO V_PE_PERSONNE(I_PERSONNE, X_NOM, X_PRENOM, I_ACS, X_NOM_LONG, X_PRENOM_LONG, D_NAISSANCE, P_SEXE, D_CREAT, X_QUICRE, D_MODIF, X_QUIMOD) VALUES(268232, 'DELORE', 'JEAN-EUDES', 6, 'Delore', 'Jean-Eude', '1981-04-29 00:00:00', 'M', '2016-01-19 11:31:38', 'Dieu', null, null);
INSERT INTO V_PE_PERSONNE(I_PERSONNE, X_NOM, X_PRENOM, I_ACS, X_NOM_LONG, X_PRENOM_LONG, D_NAISSANCE, P_SEXE, D_CREAT, X_QUICRE, D_MODIF, X_QUIMOD) VALUES(268231, 'GERARD', 'MENSOIF', 6, 'Gérard', 'Mensoif', '1981-04-30 00:00:00', 'M', '2016-01-19 11:31:38', 'Dieu', null, null);
INSERT INTO V_PE_PERSONNE(I_PERSONNE, X_NOM, X_PRENOM, I_ACS, X_NOM_LONG, X_PRENOM_LONG, D_NAISSANCE, P_SEXE, D_CREAT, X_QUICRE, D_MODIF, X_QUIMOD) VALUES(107537, 'VETTERLI', 'MARTIN', 6, 'Vetterli', 'Martin', '1981-04-30 00:00:00', 'M', '2016-01-19 11:31:38', 'Dieu', null, null);
INSERT INTO V_PE_PERSONNE(I_PERSONNE, X_NOM, X_PRENOM, I_ACS, X_NOM_LONG, X_PRENOM_LONG, D_NAISSANCE, P_SEXE, D_CREAT, X_QUICRE, D_MODIF, X_QUIMOD) VALUES(229105, 'BUGNION', 'EDOUARD', 6, 'Bugnion', 'Edouard', '1981-04-30 00:00:00', 'M', '2016-01-19 11:31:38', 'Dieu', null, null);
INSERT INTO V_PE_PERSONNE(I_PERSONNE, X_NOM, X_PRENOM, I_ACS, X_NOM_LONG, X_PRENOM_LONG, D_NAISSANCE, P_SEXE, D_CREAT, X_QUICRE, D_MODIF, X_QUIMOD) VALUES(112488, 'TANTERI', 'CHIARA', 6, 'Tanteri', 'Chiara', '1981-04-30 00:00:00', 'M', '2016-01-19 11:31:38', 'Dieu', null, null);
INSERT INTO V_PE_PERSONNE(I_PERSONNE, X_NOM, X_PRENOM, I_ACS, X_NOM_LONG, X_PRENOM_LONG, D_NAISSANCE, P_SEXE, D_CREAT, X_QUICRE, D_MODIF, X_QUIMOD) VALUES(240209, 'REVOL', 'FABIEN', 6, 'Revol', 'Fabien', '1981-04-30 00:00:00', 'M', '2016-01-19 11:31:38', 'Dieu', null, null);
INSERT INTO V_PE_PERSONNE(I_PERSONNE, X_NOM, X_PRENOM, I_ACS, X_NOM_LONG, X_PRENOM_LONG, D_NAISSANCE, P_SEXE, D_CREAT, X_QUICRE, D_MODIF, X_QUIMOD) VALUES(239841, 'MALLECK', 'KHADIDJA', 6, 'Malleck', 'Khadidja', '1981-04-30 00:00:00', 'M', '2016-01-19 11:31:38', 'Dieu', null, null);

drop table PE_UTILISE if exists;
create table PE_UTILISE (I_PERSONNE integer not null, I_ACS integer not null, D_AU_UTILISE timestamp, primary key (I_PERSONNE, I_ACS));
alter table PE_UTILISE add constraint FKrfqo4vqw27pyr4etcy3bn9aua foreign key (I_PERSONNE) references V_PE_PERSONNE;
INSERT INTO PE_UTILISE(I_ACS, I_PERSONNE, D_AU_UTILISE) VALUES(7, 268229, null);
INSERT INTO PE_UTILISE(I_ACS, I_PERSONNE, D_AU_UTILISE) VALUES(7, 268230, '2016-01-01 11:31:38');
INSERT INTO PE_UTILISE(I_ACS, I_PERSONNE, D_AU_UTILISE) VALUES(7, 268231, null);
INSERT INTO PE_UTILISE(I_ACS, I_PERSONNE, D_AU_UTILISE) VALUES(7, 268232, null);
INSERT INTO PE_UTILISE(I_ACS, I_PERSONNE, D_AU_UTILISE) VALUES(7, 107537, null);
INSERT INTO PE_UTILISE(I_ACS, I_PERSONNE, D_AU_UTILISE) VALUES(7, 229105, null);
INSERT INTO PE_UTILISE(I_ACS, I_PERSONNE, D_AU_UTILISE) VALUES(7, 112488, null);
INSERT INTO PE_UTILISE(I_ACS, I_PERSONNE, D_AU_UTILISE) VALUES(7, 240209, null);
INSERT INTO PE_UTILISE(I_ACS, I_PERSONNE, D_AU_UTILISE) VALUES(7, 239841, null);
