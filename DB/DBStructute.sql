create database MySQLTransactionDB;

CREATE TABLE IF NOT EXISTS `names` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `name` varchar(50) NOT NULL default '0',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
 
CREATE TABLE IF NOT EXISTS `log` (
  `logid` int(11) default NULL,
  `time` timestamp NOT NULL default CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;