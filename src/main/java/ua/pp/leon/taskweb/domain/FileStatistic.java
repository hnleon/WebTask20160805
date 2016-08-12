package ua.pp.leon.taskweb.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.io.Serializable;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.ReadOnlyProperty;

/**
 *
 * @author Andrii Zalevskyi <azalevskyi@gmail.com>
 */
@Data
@RequiredArgsConstructor
@Entity
public class FileStatistic implements Serializable {

    private static final long serialVersionUID = 6918924566487575879L;

    @Id
    @GeneratedValue
    private Long id;
    @Column(unique = true, nullable = false)
    protected String fileName;
    @Column(nullable = false)
    protected Integer longestWord;
    @Column(nullable = false)
    protected Integer shortestWord;
    @Column(nullable = false)
    protected Integer averageWord;
    @Column(nullable = false)
    protected Integer lineLength;

    @JsonIgnore
    @ReadOnlyProperty
    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "file_id")
    protected List<LineStatistic> lines;
}
