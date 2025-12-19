-- -----------------------------------------------------
-- Database `mydb`
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8;
USE `mydb`;

-- -----------------------------------------------------
-- Table `user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `password_hash` VARCHAR(255) NULL,
  `status` TINYINT NOT NULL,
  `date_of` TIMESTAMP NOT NULL,
  `update_of` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `project`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `title` VARCHAR(45) NOT NULL,
  `description` VARCHAR(255) NULL,
  `region` VARCHAR(45) NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `created_by` INT NOT NULL,
  `date_of` DATETIME NOT NULL,
  `update_of` DATETIME NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `project_created_by_fk`
    FOREIGN KEY (`created_by`)
    REFERENCES `user`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `organisation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `organisation` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `access_code` INT NOT NULL,
  `description` VARCHAR(255) NULL,
  `registration_num` INT NULL,
  `founded_at` DATETIME NULL,
  `country` VARCHAR(45) NOT NULL DEFAULT 'Cameroon',
  `region` VARCHAR(45) NULL,
  `admin` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `phone` VARCHAR(45) NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `date_of` TIMESTAMP NULL,
  `update_of` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `region`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `region` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `familly`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `familly` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `contact` VARCHAR(45) NULL,
  `status` TINYINT NOT NULL,
  `date_of` TIMESTAMP NOT NULL,
  `update_of` DATETIME NULL,
  `region_id` INT NOT NULL,
  `project_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `familly_region_idx` (`region_id`),
  INDEX `familly_project_idx` (`project_id`),
  CONSTRAINT `familly_region_fk`
    FOREIGN KEY (`region_id`)
    REFERENCES `region`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `familly_project_fk`
    FOREIGN KEY (`project_id`)
    REFERENCES `project`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `beneficiary`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `beneficiary` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `age` INT NOT NULL,
  `gender` VARCHAR(45) NULL,
  `location` VARCHAR(45) NOT NULL,
  `photo` VARCHAR(255) NULL,
  `sync` TINYINT NOT NULL,
  `family_id` INT NOT NULL,
  `status` TINYINT NULL,
  `date_of` TIMESTAMP NOT NULL,
  `update_of` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `beneficiary_family_idx` (`family_id`),
  CONSTRAINT `beneficiary_family_fk`
    FOREIGN KEY (`family_id`)
    REFERENCES `familly`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `support`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `support` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `created_by` INT NOT NULL,
  `date_of` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `support_created_by_fk`
    FOREIGN KEY (`created_by`)
    REFERENCES `user`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `support_log`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `support_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `beneficiary_id` INT NOT NULL,
  `support_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `project_id` INT NOT NULL,
  `family_id` INT NOT NULL,
  `photo` VARCHAR(255) NULL,
  `document` VARCHAR(255) NULL,
  `given_by` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  `synced` TINYINT NOT NULL,
  `date_of` TIMESTAMP NOT NULL,
  `update_of` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `support_log_beneficiary_idx` (`beneficiary_id`),
  INDEX `support_log_support_idx` (`support_id`),
  INDEX `support_log_user_idx` (`user_id`),
  INDEX `support_log_project_idx` (`project_id`),
  CONSTRAINT `support_log_beneficiary_fk`
    FOREIGN KEY (`beneficiary_id`)
    REFERENCES `beneficiary`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `support_log_support_fk`
    FOREIGN KEY (`support_id`)
    REFERENCES `support`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `support_log_user_fk`
    FOREIGN KEY (`user_id`)
    REFERENCES `user`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `support_log_project_fk`
    FOREIGN KEY (`project_id`)
    REFERENCES `project`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `membership`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `membership` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `organization_id` INT NOT NULL,
  `role` INT NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  `date_of` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `membership_role_idx` (`role`),
  INDEX `membership_organization_idx` (`organization_id`),
  CONSTRAINT `membership_user_fk`
    FOREIGN KEY (`user_id`)
    REFERENCES `user`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `membership_role_fk`
    FOREIGN KEY (`role`)
    REFERENCES `roles`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `membership_organization_fk`
    FOREIGN KEY (`organization_id`)
    REFERENCES `organisation`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `subscriptions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `organization_id` INT NOT NULL,
  `plan` VARCHAR(45) NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  `started_at` TIMESTAMP NOT NULL,
  `ends_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `subscriptions_organization_idx` (`organization_id`),
  CONSTRAINT `subscriptions_organization_fk`
    FOREIGN KEY (`organization_id`)
    REFERENCES `organisation`(`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;
