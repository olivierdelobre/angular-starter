drop table V_EPFL_BAT if exists;
drop table V_EPFL_ESP if exists;
drop table V_EPFL_SIT if exists;
drop table V_EPFL_ZON if exists;
drop sequence if exists hibernate_sequence;
create sequence hibernate_sequence start with 1 increment by 1;
create table V_EPFL_BAT (I_BAT integer not null, X_ADR_RUE_1 varchar(255), X_ADR_RUE_2 varchar(255), X_ADR_NP_VILLE varchar(255), X_LIB_BAT varchar(255), X_ABR_BAT varchar(255), N_ORDRE_PTT integer, I_SIT integer, X_STATION varchar(255), primary key (I_BAT));
create table V_EPFL_ESP (I_ESP integer not null, I_BAT integer, X_ABR_ETAGE varchar(255), X_ABR_ESP varchar(255), X_NO_ESP varchar(255), I_SIT integer, I_ZON integer, primary key (I_ESP));
create table V_EPFL_SIT (I_SIT integer not null, X_LIB_SIT varchar(255), X_ABR_SIT varchar(255), N_PRIORITE integer, X_CODE_USUEL_SITE varchar(255), primary key (I_SIT));
create table V_EPFL_ZON (I_ZON integer not null, I_BAT integer, X_LIB_ZON varchar(255), X_ABR_ZON varchar(255), X_ABR_ETAGE varchar(255), I_SIT integer, primary key (I_ZON));
alter table V_EPFL_ESP add constraint FKn925bcmwlmyvgs8rrxowax8mv foreign key (I_BAT) references V_EPFL_BAT;

SET foreign_key_checks = 0;

TRUNCATE TABLE V_EPFL_ESP;
INSERT INTO V_EPFL_ESP (I_ESP, I_SIT, I_BAT, I_ZON, X_NO_ESP, X_ABR_ESP, X_ABR_ETAGE) VALUES(4200, 3, 21, 2681, '041', 'INN 041', '0');
INSERT INTO V_EPFL_ESP (I_ESP, I_SIT, I_BAT, I_ZON, X_NO_ESP, X_ABR_ESP, X_ABR_ETAGE) VALUES(31558, 3, 21, 2681, '013', 'INN 013', '0');
INSERT INTO V_EPFL_ESP (I_ESP, I_SIT, I_BAT, I_ZON, X_NO_ESP, X_ABR_ESP, X_ABR_ETAGE) VALUES(4521, 3, 40, 2681, '393', 'MA A0 393', '0');
INSERT INTO V_EPFL_ESP (I_ESP, I_SIT, I_BAT, I_ZON, X_NO_ESP, X_ABR_ESP, X_ABR_ETAGE) VALUES(4193, 3, 21, 2681, '033', 'INN 033', '0');
INSERT INTO V_EPFL_ESP (I_ESP, I_SIT, I_BAT, I_ZON, X_NO_ESP, X_ABR_ESP, X_ABR_ETAGE) VALUES(943, 3, 21, 2681, '316', 'CE 3 316', '0');

TRUNCATE TABLE V_EPFL_BAT;
INSERT INTO V_EPFL_BAT (I_BAT, I_SIT, X_ABR_BAT, X_LIB_BAT, X_ADR_RUE_1, X_ADR_RUE_2, X_ADR_NP_VILLE, X_STATION, N_ORDRE_PTT) VALUES(21, 3, 'INN', 'Bâtiment INN', 'EPFL - Ecublens', 'La Méridienne', 'CH-1015 Lausanne VD', 'Station 14', 1234);
INSERT INTO V_EPFL_BAT (I_BAT, I_SIT, X_ABR_BAT, X_LIB_BAT, X_ADR_RUE_1, X_ADR_RUE_2, X_ADR_NP_VILLE, X_STATION, N_ORDRE_PTT) VALUES(40, 3, 'MA', 'Bâtiment MA', 'EPFL - Ecublens', 'Av. Piccard 3 / Les Terrasses 4', 'CH-1015 Lausanne VD', 'Station 8', 1234);

TRUNCATE TABLE V_EPFL_ZON;
INSERT INTO V_EPFL_ZON (I_ZON, I_BAT, I_SIT, X_ABR_ZON, X_LIB_ZON, X_ABR_ETAGE) VALUES(2681, 21, 3, 'Z', 'Bât. INN niveau 0', '0');
INSERT INTO V_EPFL_ZON (I_ZON, I_BAT, I_SIT, X_ABR_ZON, X_LIB_ZON, X_ABR_ETAGE) VALUES(2708, 40, 3, 'Z', 'Bât. MA niveau 0', '0');

TRUNCATE TABLE V_EPFL_SIT;
INSERT INTO V_EPFL_SIT (I_SIT, X_ABR_SIT, X_LIB_SIT, N_PRIORITE, X_CODE_USUEL_SITE) VALUES(3, 'E', 'ECUBLENS', 1, '');
INSERT INTO V_EPFL_SIT (I_SIT, X_ABR_SIT, X_LIB_SIT, N_PRIORITE, X_CODE_USUEL_SITE) VALUES(12, 'N', 'NEUCHATEL', 5, 'Microcity');
