CREATE TABLE mlbdata (
  
  `date`								  DATE 		     default null,
  `year`					  			INT(2) 		   default null,
  `gamepk`				  			INT(3) 		   default null,
  `type`					  			VARCHAR(1)   default null,
  `game_type`			  			VARCHAR(1)   default null,
  `temp`					  			INT(2) 		   default null,
  `condition`			  			VARCHAR(30)  default null,
  `wind`					  	    VARCHAR(30)  default null,
  `venue`					  			INT(2) 		   default null,
  `home_team`			  			VARCHAR(3)   default null,
  `away_team`			  			VARCHAR(3)   default null,
  `batter`				  			INT(3) 		   default null,
  `batter_name`		  			VARCHAR(150) default null,
  `stand`					  			VARCHAR(1)   default null,
  `pitcher`				  			INT(2) 		   default null,
  `pitcher_name`	  			VARCHAR(150) default null,
  `throws`				  		  VARCHAR(1) 	 default null,
  `events`				  			VARCHAR(50)  default null,
  `description`		  			VARCHAR(50)  default null,
  
  `inning`					  		INT(1) 		   default null,
  `topbot`				        VARCHAR(3)   default null,
  `ABnum`						  		INT(2) 		   default null,
  `Pitchnum`				  		INT(2) 		   default null,
  
  `pitch_balls`			  		INT(1) 		   default null,
  `pitch_strikes`		  		INT(1)			 default null,
  `pitch_outs`		        INT(1) 		   default null,
  `pitch_call`			  		VARCHAR(50)  default null,
  `pitch_type`			  		VARCHAR(2)   DEFAULT NULL,
  `pitch_startSpeed`  		DECIMAL(8,3) default null,
  `pitch_endSpeed`	  	  DECIMAL(8,3) default null,
  `pitch_sz_top`		  		DECIMAL(6,3) default null,
  `pitch_sz_bot`		  		DECIMAL(6,3) default null,
  `pitch_x0`				  		DECIMAL(8,3) default null,
  `pitch_y0`				  		DECIMAL(8,3) default null,
  `pitch_z0`				  		DECIMAL(6,3) default null,
  `pitch_extension`	  	  DECIMAL(6,3) default null,
  `pitch_vx0`					  	DECIMAL(6,3) default null,
  `pitch_vy0`						  DECIMAL(6,3) default null,
  `pitch_vz0`			  			DECIMAL(6,3) default null,
  `pitch_ax`			  			DECIMAL(6,3) default null,
  `pitch_ay`			  			DECIMAL(6,3) default null,
  `pitch_az`			  			DECIMAL(6,3) default null,
  `pitch_pfx_x`		  			DECIMAL(8,3) default null,
  `pitch_pfx_z`		  			DECIMAL(8,3) default null,
  `pitch_px`			  			DECIMAL(8,3) default null,
  `pitch_pz`			  			DECIMAL(8,3) default null,
  `pitch_x`				 		    DECIMAL(8,3) default null,
  `pitch_y`						    DECIMAL(8,3) default null,
  `pitch_breakAngle`	    DECIMAL(4,1) default null,
  `pitch_breakLength`	    DECIMAL(4,1) default null,
  `pitch_break_y`	        INT(1) 		   default null,
  `pitch_spinrate`			  INT(2) 		   default null,
  `pitch_breakDirection`  INT(2) 		   default null,
  `pitch_zone`` 	        INT(1) 		   default null,
  `pitch_plateTime`	      DECIMAL(4,2) default null,
  
  `bip_EV`							  DECIMAL(4,1) default null,
  `bip_VA`							  INT(1) 		   default null,
  `bip_distance`				  INT(2) 		   default null,
  `bip_type`							VARCHAR(30)  default null,
  `bip_hardness`				  VARCHAR(30)  default null,
  `bip_location`				  INT(1) 		   default null,
  `bip_hc_x`							DECIMAL(8,3) default null,
  `bip_hc_y`							DECIMAL(8,3) default null,
  
  `MLB_playID`						VARCHAR(36)  default null,
  `ID`									  VARCHAR(30) PRIMARY KEY
);