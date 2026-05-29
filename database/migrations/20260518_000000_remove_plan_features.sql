-- Remove plan features that should no longer appear on subscription cards
-- Affected: Guía de preparación (plan 1), Notas de cata exclusivas + Acceso a café de temporada (plan 2),
--           Mix de variedades + Descuento en compras adicionales + Acceso prioritario (plan 3)

DELETE FROM `plan_features` WHERE `id` IN (6, 12, 13, 19, 20, 21);
