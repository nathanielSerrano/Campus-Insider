-- to speed up delete campus and procedures that check campus
CREATE INDEX idx_campus_univ
ON campus (university_id, campus_name);

-- to speed up querys regarding university_id
CREATE INDEX idx_location_full
ON location (university_id, campus_name, name);

-- to speed up procedures using room_number
CREATE INDEX idx_rooms_building_roomnum 
ON rooms (building_LID, room_number);

-- room search improvements (very common)
CREATE INDEX idx_rooms_type
ON rooms (room_type);
CREATE INDEX idx_rooms_size
ON rooms (room_size);

-- to speed up user searches
CREATE INDEX idx_users_univ_username
ON users (university_id, username);

-- to speed up rating searches
CREATE INDEX idx_ratings_UID_LID
ON ratings (UID, LID);
