package ua.pp.leon.taskweb.domain;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import lombok.Data;
import lombok.RequiredArgsConstructor;

/**
 *
 * @author Andrii Zalevskyi <azalevskyi@gmail.com>
 */
@Data
@RequiredArgsConstructor
@Entity
public class LineStatistic implements Serializable {

    private static final long serialVersionUID = 5384825094605228068L;

    @Id
    @GeneratedValue
    private Long id;
    @Column(name = "file_id", nullable = false)
    private Long fileId;
    @Column(nullable = false)
    protected Integer longestWord;
    @Column(nullable = false)
    protected Integer shortestWord;
    @Column(nullable = false)
    protected Integer averageWord;
    @Column(nullable = false)
    protected Integer lineLength;
}
