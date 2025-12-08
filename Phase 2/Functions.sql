-- Functions, run the functions first before the procedures since they are used by the them.
 use campus_insider;
DELIMITER $$
CREATE FUNCTION GetUniversityIDByNameAndState(
    p_name VARCHAR(100),
    p_state VARCHAR(50)
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE univ_id INT;

    SELECT university_id
    INTO univ_id
    FROM university
    WHERE name = p_name
      AND state = p_state
    LIMIT 1;

    RETURN univ_id;
END$$
DELIMITER ;

