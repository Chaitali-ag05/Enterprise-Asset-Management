package com.assetmanagement.asset.repository;

import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.asset.enums.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    boolean existsByAssetCode(String assetCode);

    boolean existsBySerialNumber(String serialNumber);

    boolean existsBySerialNumberAndIdNot(String serialNumber, Long id);

    Optional<Asset> findTopByOrderByIdDesc();

    List<Asset> findByStatus(AssetStatus status);

    List<Asset> findByStatusNot(AssetStatus status);

    List<Asset> findByAssignedEmployeeId(Long employeeId);

    Optional<Asset> findByAssetCode(String assetCode);
}