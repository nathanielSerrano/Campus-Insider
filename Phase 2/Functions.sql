-- Functions, run the functions first before the procedures since they are used by the them.
 
DELIMITER $$
CREATE FUNCTION GetUniversityIDByName(p_name VARCHAR(100))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE univ_id INT;

    SELECT university_id
    INTO univ_id
    FROM university
    WHERE name = p_name
    LIMIT 1;

    RETURN univ_id;
END$$
DELIMITER ;
